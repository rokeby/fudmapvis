import csv
import re
import json
import regex as re
from geojson import LineString, Feature, FeatureCollection

with open('hurdat.csv', newline='') as csvfile:
	data = csv.reader(csvfile, delimiter=',')
	# print(data)

	old=[]
	for row in data:
		old.append(row)

hurricane = []
features = []
name='ABLE'

for row in old[1:]:
	coord=[]
	num=0
	if row[4] != '':
		if 'W' in row[5]:
			coord.append(-float(re.sub('W', '', row[5])))
		elif 'E' in row[5]:
			coord.append(float(re.sub('E', '', row[5])))
		else: break

		if 'N' in row[4]:
			coord.append(float(re.sub('N', '', row[4])))
		elif 'S' in row[4]:
			coord.append(-float(re.sub('S', '', row[4])))
		else: break

		hurricane.append(coord)
	else:
		linestring = LineString(hurricane)
		features.append(Feature(geometry=linestring, properties={'number': num, 'name': name}))
		name = row[1].strip()
		hurricane=[]
		num = num+1

geojson = FeatureCollection(features)

features.pop(6)

# print(geojson)

json = json.dumps(geojson, indent=2, sort_keys=True)
f = open("hurdat-big.geojson","w")
f.write(json)
f.close()
