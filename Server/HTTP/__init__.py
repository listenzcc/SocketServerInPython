# File: __init__.py
# Aim: HTTP package initialization

import os
import configparser
from ..QuickPythonConfig.Package import Config
from .local_tools import Tools

# Full path of setting file
setting_path = os.path.join(os.path.dirname(__file__), 'setting.ini')

# Early parse of the setting file
parser = configparser.ConfigParser()
parser.read(setting_path)

# Init Config
CONFIG = Config()
CONFIG.reload_logger(log_filepath=parser.get('Runtime', 'logpath'),
                     name=parser.get('Runtime', 'mode'))
CONFIG.reload_cfg(setting_path)

print(CONFIG.peek())

# Setup basic tools
tools = Tools(
    coding=CONFIG.get('Server', 'coding'),
    buffer_size=int(CONFIG.get('Server', 'bufferSize')),
)
