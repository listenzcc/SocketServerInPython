# File: fetch_useful_js.py
# Aim: Fetch useful js libraries

# %%
import configparser
import os
import pandas as pd
import requests
import time
import traceback


def beside(fname):
    return os.path.join(os.path.dirname(__file__), fname)


def unwrap(content):
    return content[1:-1]


# %%
cp = configparser.ConfigParser()
cp.read(beside('useful_js.ini'))
cp.sections()

# %%
option = 'user-agent'
headers = {option: unwrap(cp.get('Headers', option))}
table = pd.DataFrame()
URLs = cp['URLs']
for option in URLs:
    table = table.append(
        dict(Name=option, URL=unwrap(URLs[option]), Date=time.ctime()), ignore_index=True)
table.to_html('Known_js.html')


# %%
for j in table.index:
    se = table.iloc[j]
    name, url = se.Name, se.URL
    fname = os.path.basename(url)
    print(f'Fetching {name}, {fname}: {url}')
    try:
        got = requests.get(url)
        text = got.text
        with open(beside(fname), 'wb') as f:
            f.write(text.encode('utf-8'))
    except:
        print('Fail on fetching: {}'.format(traceback.format_exc()))


# %%
