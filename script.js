// Define a variable to keep track of the current active state
let activeState = null;

// Define the reusable function to create the line chart
function createLineChart(state, data) {
  // Remove the existing chart if there is any
  clearActiveChart();

  // Set up the dimensions for the chart
  const width = 800; // Increased width to accommodate labels and axes
  const height = 500; // Increased height to accommodate labels and axes
  const margin = { top: 80, right: 120, bottom: 120, left: 60 }; // Adjusted margins to make space for labels and axes
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Parse the date and convert it to a JavaScript Date object
  const parseDate = d3.timeParse("%m/%d/%Y");
  data.forEach(d => {
    d.submission_date = parseDate(d.submission_date);
    d.new_cases = +d.new_cases;
  });

  // Sort data by submission_date
  data.sort((a, b) => a.submission_date - b.submission_date);

  // Create the X and Y scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.submission_date))
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.new_cases)])
    .range([innerHeight, 0]);

  // Create the line function
  const line = d3
    .line()
    .x(d => xScale(d.submission_date))
    .y(d => yScale(d.new_cases));

  // Append the SVG element to the chart container
  const svg = d3
    .select("#chart-container-" + state)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group for the chart area and apply margins
  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add the line to the chart
  chart
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

  // Find the low and high points in the data
  const lowPoint = data.reduce((min, current) => (current.new_cases < min.new_cases ? current : min));
  const highPoint = data.reduce((max, current) => (current.new_cases > max.new_cases ? current : max));

  // Add circles for low and high points
  chart
    .append("circle")
    .attr("cx", xScale(lowPoint.submission_date))
    .attr("cy", yScale(lowPoint.new_cases))
    .attr("r", 6)
    .attr("fill", "red");

  chart
    .append("circle")
    .attr("cx", xScale(highPoint.submission_date))
    .attr("cy", yScale(highPoint.new_cases))
    .attr("r", 6)
    .attr("fill", "green");

  // Add text labels to the circles
  chart
    .append("text")
    .attr("x", xScale(lowPoint.submission_date) + 10)
    .attr("y", yScale(lowPoint.new_cases) - 20) // Adjusted y position for better positioning
    .attr("fill", "red")
    .text("Least Daily Cases");

  chart
    .append("text")
    .attr("x", xScale(highPoint.submission_date) - 100) // Adjusted x position for better positioning
    .attr("y", yScale(highPoint.new_cases) - 20) // Adjusted y position for better positioning
    .attr("fill", "green")
    .text("Most Daily Cases");

  // Add annotations for low and high points values
  chart
    .append("text")
    .attr("x", xScale(lowPoint.submission_date) + 10)
    .attr("y", yScale(lowPoint.new_cases) - 40) // Adjusted y position for better positioning
    .attr("fill", "red")
    .text(`Value: ${lowPoint.new_cases}`);

  chart
    .append("text")
    .attr("x", xScale(highPoint.submission_date) - 100) // Adjusted x position for better positioning
    .attr("y", yScale(highPoint.new_cases) - 60) // Adjusted y position for better positioning
    .attr("fill", "green")
    .text(`Value: ${highPoint.new_cases}`);

  // Add X-axis
  chart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  // Add Y-axis
  chart.append("g").call(d3.axisLeft(yScale));

  // Add X-axis label
  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50) // Adjusted y position for better positioning
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Month");

  // Add Y-axis label
  chart
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 20) // Adjusted y position for better positioning
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .attr("transform", "rotate(-90)")
    .text("Number of New Cases");

  // Add Title
  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text(`Daily ${state} COVID-19 Cases`);


  // Set the current state as the active state
  activeState = state;
}

// Function to remove the chart of the active state
function clearActiveChart() {
  if (activeState) {
    if (activeState === "combined") {
      // If the active state is the combined chart, remove its SVG container
      d3.select("#chart-container-combined").select("svg").remove();
    } else {
      // If the active state is a single state chart, remove its SVG
      d3.select("#chart-container-" + activeState).select("svg").remove();
    }
  }
}

// Function to show the respective chart when a button is clicked
function showChart(state) {
  // Load the data for the selected state and create the corresponding chart
  if (state === "NY") {
    d3.json("data/ny_data.json").then(data => createLineChart(state, data));
  } else if (state === "NJ") {
    d3.json("data/nj_data.json").then(data => createLineChart(state, data));
  } else if (state === "PA") {
    d3.json("data/pa_data.json").then(data => createLineChart(state, data));
  }
}

function createCombinedChart(dataNY, dataNJ, dataPA) {
  // Remove the existing chart if there is any
   clearActiveChart();

  const containerId = "chart-container-combined";

  // Set up the dimensions for the chart
  const width = 800; // Increased width to accommodate labels and axes
  const height = 500; // Increased height to accommodate labels and axes
  const margin = { top: 80, right: 120, bottom: 120, left: 60 }; // Adjusted margins to make space for labels and axes
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%m/%d/%Y"); // Adjusted date format here

  // Parse the date for each state's data and sort by submission_date
  dataNY.forEach(d => {
    d.submission_date = parseDate(d.submission_date);
    d.new_cases = +d.new_cases; // Convert "new_cases" to a numeric value
  });
  dataNY.sort((a, b) => a.submission_date - b.submission_date);

  dataNJ.forEach(d => {
    d.submission_date = parseDate(d.submission_date);
    d.new_cases = +d.new_cases; // Convert "new_cases" to a numeric value
  });
  dataNJ.sort((a, b) => a.submission_date - b.submission_date);

  dataPA.forEach(d => {
    d.submission_date = parseDate(d.submission_date);
    d.new_cases = +d.new_cases; // Convert "new_cases" to a numeric value
  });
  dataPA.sort((a, b) => a.submission_date - b.submission_date);

  // Combine data from all states into one array
  const dataCombined = [
    { state: "NY", data: dataNY },
    { state: "NJ", data: dataNJ },
    { state: "PA", data: dataPA },
  ];

    console.log("Data for NY:", dataNY);
    console.log("Data for NJ:", dataNJ);
    console.log("Data for PA:", dataPA);
    console.log("Combined:", dataCombined);
  
  

  // Find the maximum number of new cases across all data to set the common Y scale
  const maxNewCases = d3.max(dataCombined, d => d3.max(d.data, d => d.new_cases));

  // Find the low and high points in the data for each state
  const lowPoints = dataCombined.map(({ state, data }) => ({
    state,
    point: data.reduce((min, current) => (current.new_cases < min.new_cases ? current : min)),
  }));

  const highPoints = dataCombined.map(({ state, data }) => ({
    state,
    point: data.reduce((max, current) => (current.new_cases > max.new_cases ? current : max)),
  }));



  // Create the X and Y scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataNY.concat(dataNJ, dataPA), d => d.submission_date))
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxNewCases])
    .range([innerHeight, 0]);

  // Create the line function
  const line = d3
    .line()
    .x(d => xScale(d.submission_date))
    .y(d => yScale(d.new_cases));

  
  const svg = d3
    .select("#chart-container-combined")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group for the chart area and apply margins
  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const colorScale = d3.scaleOrdinal()
  .domain(dataCombined.map(d => d.state))
  .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);


  // Add the lines to the chart
  const lineGroups = chart
    .selectAll(".line-group")
    .data(dataCombined)
    .enter()
    .append("g")
    .attr("class", "line-group");

  lineGroups
    .append("path")
    .datum(d => d.data)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", d => colorScale(d.state));

    lowPoints.forEach(({ state, point }) => {
      chart
        .append("text")
        .attr("x", xScale(point.submission_date) + 10)
        .attr("y", yScale(point.new_cases) - 10) // Adjusted y position to prevent text overflow
        .attr("fill", "red")
        .text(`Least Daily Cases (${state}): ${point.new_cases}`);
    });
  
    // Add the annotations for high points
    highPoints.forEach(({ state, point }) => {
      chart
        .append("text")
        .attr("x", xScale(point.submission_date) - 110) // Adjusted x position to prevent text overflow
        .attr("y", yScale(point.new_cases) - 10) // Adjusted y position to prevent text overflow
        .attr("fill", "green")
        .text(`Most Daily Cases (${state}): ${point.new_cases}`);
    });

  // Add legend for the lines
  chart
    .append("g")
    .selectAll(".legend")
    .data(dataCombined)
    .enter()
    .append("text")
    .attr("x", innerWidth + 10)
    .attr("y", (d, i) => 20 + i * 20)
    .attr("fill", d => colorScale(d.state)) // Use the color scale for text fill color
    .text(d => `State: ${d.state}`);

  // Add X-axis
  chart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  // Add Y-axis
  chart.append("g").call(d3.axisLeft(yScale));

  // Add X-axis label
  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50) // Adjusted y position for better positioning
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Month");

  // Add Y-axis label
  chart
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 20) // Adjusted y position for better positioning
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .attr("transform", "rotate(-90)")
    .text("Number of New Cases");

  // Add Title
  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Combined New Cases for All States");

  // Set the current state as the active state
  activeState = "combined";
}

function showCombinedChart() {
  // Load the data for all states and create the combined chart
  Promise.all([
    d3.json("data/ny_data.json"),
    d3.json("data/nj_data.json"),
    d3.json("data/pa_data.json"),
  ]).then(([dataNY, dataNJ, dataPA]) => {
    // Log the data points for NY, NJ, and PA
    console.log("Data for NY:", dataNY);
    console.log("Data for NJ:", dataNJ);
    console.log("Data for PA:", dataPA);

    createCombinedChart(dataNY, dataNJ, dataPA);
  });
}



// Initial chart to show when the page loads (e.g., NY)
d3.json("data/ny_data.json").then(data => createLineChart("NY", data));
