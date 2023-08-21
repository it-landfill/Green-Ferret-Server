import sys
from pathlib import Path
import json

import pandas as pd
import numpy as np
import geopandas as gp
import matplotlib

import gtfs_kit as gk

feed_file = "/Users/aleben/UniProjects/Green-Ferret/Green-Ferret-Server/docker-stack/services/influx_data_generator/resources/gommagtfsbo_20230607.zip"

feed = gk.read_feed(feed_file, dist_units='km')

todayRoute_13 = feed.build_route_timetable("13", ["20230630"])
todayRoute_20 = feed.build_route_timetable("20", ["20230630"])
todayRoute_25 = feed.build_route_timetable("25", ["20230630"])
todayRoute_29 = feed.build_route_timetable("29", ["20230630"])
todayRoutes = pd.concat([todayRoute_13, todayRoute_20, todayRoute_25, todayRoute_29])

todayRoutes_coords = pd.merge(todayRoutes, feed.stops, how="left", on=["stop_id"])

cols = [
    "stop_id",
    "route_id",
    "arrival_time",
    "stop_lat",
    "stop_lon"
]
todayRoutes_filtered = todayRoutes_coords[cols]

todayRoutes_filtered = todayRoutes_filtered[(todayRoutes_filtered.arrival_time >= "09:00:00") & (todayRoutes_filtered.arrival_time <= "12:00:00")]

print(todayRoutes_filtered)
todayRoutes_filtered.to_csv("../data/todayRoutes.csv", index=False)
