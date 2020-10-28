# File: __init__.py
# Aim: Package initial
# Package version: 1.0

# %%
from .defines import Config

CONFIG = Config()
CONFIG.reload_logger(name='develop')

# %%
