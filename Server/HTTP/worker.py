# File: worker.py
# Aim: Backend worker of the http server

# Imports
import os
from . import CONFIG
from .local_tools import Tools

tools = Tools()
CONFIG.logger.debug('Worker imported in HTTP package')


class Worker(object):
    # Backend worker object
    def __init__(self):
        CONFIG.logger.info(f'Worker initialized')

    def _synchronize_settings(self):
        self.src_dir = CONFIG.get('Runtime', 'srcDir')
        self.default_src_dir = CONFIG.get('Default', 'srcDir')
        self.known_types = CONFIG.get_section('KnownTypes')
        CONFIG.logger.debug(
            'Worker synchronized settings: src_dir={}, default_src_dir={}, known_types={}'.format(
                self.src_dir,
                self.default_src_dir,
                self.known_types))

    def fullpath(self, path):
        # Make full path based on [path] in request
        for dir, name in zip([self.src_dir, self.default_src_dir], ['srcDir', 'defaultSrcDir']):
            # Try src_dir and default_src_dir in order
            full = os.path.join(dir, path)
            if os.path.isfile(full):
                CONFIG.logger.debug(
                    f'Found {path} in {name}, using it in response')
                return full
        CONFIG.logger.warning(
            f'Can not find {path} in known dirs, return None')
        return None

    def response(self, request):
        # Make response of [request]
        # Synchronize settings
        self._synchronize_settings()

        # Fetch method and path
        method = request['method']
        path = request['path'][1:]

        # Make response
        if method == 'GET':
            # Response to 'GET' request
            # Get useable fullpath
            full = self.fullpath(path)

            # Can not find file
            if full is None:
                return tools.make_response(resCode='HTTP/1.1 404',
                                           resContent=f'Not Found {path}')

            # Found file
            # Get ext
            ext = path.split('.')[-1]
            # Find file type
            resType = 'Content-Type: {}'.format(
                self.known_types.get(ext, 'text/html')
            )
            # Read file
            with open(full, 'rb') as f:
                resContent = f.read()
            # Make response and return
            return tools.make_response(resType=resType,
                                       resContent=resContent)
