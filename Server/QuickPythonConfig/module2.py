# Example of using default CONFIG object
from Package import CONFIG


def main():
    CONFIG.logger.info('Module 2 is running.')
    CONFIG.logger.debug('Module 2 is running.')

    CONFIG.set('Module 2', 'says', 'Hello, there')
