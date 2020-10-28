# Example of using customized Config object
from Package.defines import Config

config = Config()
config.reload_logger('develop')
config.reload_cfg()


def main():
    print('---------------------------------------------------------')
    print(config.peek())
    config.set('Module 3', 'says', 'It should be a brand new configure')
    print(config.peek())
