import csv
import re
import json
import regex as re
from datetime import datetime
from geojson import Point, LineString, Feature, FeatureCollection,MultiPoint

#static files
from storm_classifier import classifier

with open('hurdat.csv', newline='') as csvfile:
	data = csv.reader(csvfile, delimiter=',')
	# print(data)

	old=[]
	for row in data:
		old.append(row)

hurricane = []
list = []
name='ABLE'
num=0

for row in old[1:]:
	coord=[]
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

		date = datetime.strptime(row[0], "%Y%m%d")
		point = Feature(geometry=Point(coord), 
			properties={
				'class': row[3].strip(), 
				'date': date.strftime('%m-%d-%Y'),
				'risk': classifier[row[3].strip()]['risk'],
				'report': classifier[row[3].strip()]['description']
			})
		hurricane.append(point)
	else:
		list.append(
			{
				'geoJSON': FeatureCollection(hurricane),
				'metadata': {'number': num, 'name': name }
			})
		print(name, num)
		name = row[1].strip()
		hurricane=[]
		num = num+1

list.sort(key=lambda x: len(x['geoJSON']['features']), reverse=True)
#print('max len is', len(list[0]['geoJSON']['features']), 'next is', len(list[1]['geoJSON']['features']), len(list[2]['geoJSON']['features']), len(list[3]['geoJSON']['features']), len(list[10]['geoJSON']['features']))

for hurr in list:
	print(len(hurr['geoJSON']['features']))

json = json.dumps(list, indent=2, sort_keys=True)
f = open("hurdat-featsize.geojson","w")
f.write(json)
f.close()
