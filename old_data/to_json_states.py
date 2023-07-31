import csv
import json

def csv_to_json(csv_file, json_file):
    data = []
    with open(csv_file, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)

    with open(json_file, 'w') as jsonfile:
        json.dump(data, jsonfile, indent=4)

csv_to_json('ny_data.csv', 'ny_data.json')
csv_to_json('nj_data.csv', 'nj_data.json')
csv_to_json('pa_data.csv', 'pa_data.json')