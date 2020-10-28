# File: __init__.py
# Aim: Package initial implementation

import os
import configparser
from ..QuickPythonConfig.Package import Config
from .local_tools import Tools

setting_path = os.path.join(os.path.dirname(__file__),
                            'setting.ini')

parser = configparser.ConfigParser()
parser.read(setting_path)

CONFIG = Config()
CONFIG.reload_logger(log_filepath=parser.get('Runtime', 'logpath'),
                     name=parser.get('Runtime', 'mode'))
CONFIG.reload_cfg(setting_path)

print(CONFIG.peek())

tools = Tools(
    coding=CONFIG.get('Server', 'coding'),
    buffer_size=int(CONFIG.get('Server', 'bufferSize')),
)
