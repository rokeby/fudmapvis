import csv
import re

rowfinal = []

with open('katrina_latLng.csv', newline='') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=',')
	for row in spamreader:
		latLng = ",".join(row)
		rowclean = re.sub("[NW]", "", latLng)
		rowfix = rowclean[:5] + ' -' + rowclean[5:]
		rowfinal.append("\n" + rowfix)
	
	rowfinal = "".join(rowfinal)
	print(rowfinal)


with open('katrina_latLng_cleaned.csv', mode='w') as csvfilecleaned:
	csvfilewriter = csv.writer(csvfilecleaned, delimiter=',')
	csvfilewriter.writerow(rowfinal)