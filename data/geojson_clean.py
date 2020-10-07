import csv
import re
import json
from geojson import LineString, Feature, FeatureCollection

katrina_old = []
katrina_new = []

with open('katrina_latLng_cleaned.csv', newline='') as csvfile:
	data = csv.reader(csvfile, delimiter=',')
	# print(data)
	
	for row in data:
		katrina_old.append(row)

katrina_old_cleaned = []

for i in katrina_old[1:]:
	i = sorted(i)
	for n in range(len(i)):
		i[n] = float(i[n])
	katrina_old_cleaned.append(i)

# with open('hike.geojson') as json_file:
# 	geodata = json.load(json_file)
# 	# print(geodata["features"])
# 	for p in geodata["features"][0]["geometry"]["coordinates"]:
# 		katrina_new.append(p)

# 	for i in range(len(katrina_old_cleaned)):
# 		# print(katrina_old[i])
# 		katrina_new[i] = katrina_old_cleaned[i]
# 		# print(katrina_old)

linestring = LineString(katrina_old_cleaned)

feature = Feature(geometry=linestring)

katrina_geojson = FeatureCollection(feature)

print(katrina_geojson)

json = json.dumps(katrina_geojson, indent=2, sort_keys=True)
f = open("katrina.geojson","w")
f.write(json)
f.close()
