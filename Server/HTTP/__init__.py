# File: __init__.py
# Aim: HTTP package initialization

import configparser
import os
from ..QuickPythonConfig.Package import Config

dirname = os.path.dirname(__file__)

# Full path of setting file
setting_path = os.path.join(dirname, 'setting.ini')

# Early parse of the setting file
parser = configparser.ConfigParser()
parser.read(setting_path)

# Init Config
CONFIG = Config()
CONFIG.reload_logger(log_filepath=parser.get('Runtime', 'logPath'),
                     name=parser.get('Runtime', 'mode'))
CONFIG.reload_cfg(setting_path)

# Set necessary Config values
CONFIG.set('Default', 'packageDir', dirname)

# Show what we got
CONFIG.logger.debug(f'Current configure:\n{CONFIG.peek()}')
