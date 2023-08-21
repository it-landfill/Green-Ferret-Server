import pandas as pd
import numpy as np

block_num = 0

df = pd.read_csv("../data/todayRoutes.csv")
key = "aca047c6e64a8529adaa89db029abb1a"

print(df.iloc[block_num*1000:(block_num+1)*1000])