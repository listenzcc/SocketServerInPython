# Example of using default CONFIG object
import time
from Package import CONFIG


def main():
    CONFIG.logger.info('Module 1 is running.')
    CONFIG.logger.debug('Module 1 is running.')

    CONFIG.set('Module 1', 'started', time.ctime())
