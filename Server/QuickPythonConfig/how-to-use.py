# %%
from Package import CONFIG
from module1 import main as m1
from module2 import main as m2
from module3 import main as m3

# %%
# Logger starts with console output everything
CONFIG.reload_logger(name='develop')
# Use example configure.ini
CONFIG.reload_cfg('examples/example_config.ini')
# Setup a.b: abc
CONFIG.set('a', 'b', 'abc')
# Reset a.b
CONFIG.reset('a', 'b')
# Setup a.b: def
CONFIG.set('a', 'b', 'def')
# Incorrect reset, since Section c doesn't exist
CONFIG.reset('c', 'b')
# Get a.b, it should be 'def'
CONFIG.get('a', 'b')
# Incorrect get a.c, since the Option c doesn't exist in Section a,
# but the error is suppressed from raising
CONFIG.get('a', 'c', True)
# Peek the configures in a DataFrame
print(CONFIG.peek())

# %%
# CONFIG is called by the modules
# Switch the logger mode
# Suppress DEBUGs
CONFIG.reload_logger(name='release')
m1()
m2()

# Console print DEBUGs
CONFIG.reload_logger(name='develop')
m2()

print(CONFIG.get_section('Section I'))
print(CONFIG.get_section('Section III'))

# Peek the configures
CONFIG.reload_logger(name='release')
print(CONFIG.peek())

m3()
