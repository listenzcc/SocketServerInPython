# File: worker.py
# Aim: Backend worker of the http server

# Imports
from . import CONFIG
from .local_tools import Tools

tools = Tools()
CONFIG.logger.debug('Worker imported in HTTP package')

src_dir = CONFIG.get('Runtime', 'srcDir')
default_src_dir = CONFIG.get('Default', 'srcDir')
known_types = CONFIG.get_section('KnownTypes')

print(src_dir, default_src_dir, known_types)


class Worker(object):
    # Backend worker object
    def __init__(self):
        pass
