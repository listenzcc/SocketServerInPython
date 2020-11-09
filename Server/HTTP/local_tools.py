# File: local_tools.py
# Aim: Provide reuseable tools for the package

import os
from . import CONFIG

coding = CONFIG.get('Server', 'coding')
buffer_size = int(CONFIG.get('Server', 'bufferSize'))
default_src_dir = CONFIG.get('Default', 'srcDir')


class Tools(object):
    def __init__(self, coding=coding, buffer_size=buffer_size):
        self.coding = coding
        self.buffer_size = buffer_size
        CONFIG.logger.debug(
            f'Tools initialized as coding: {coding}, buffer_size: {buffer_size}')

    def decode(self, content):
        # Decode [content] if necessary
        if isinstance(content, type(b'')):
            return content.decode(self.coding)
        else:
            return content

    def encode(self, content):
        # Encode [content] if necessary
        if isinstance(content, type('')):
            return content.encode(self.coding)
        else:
            return content

    def parse_request(self, request):
        # Parse the [request]
        # We only deal with the decoded string
        request = self.decode(request)
        CONFIG.logger.debug(f'Parsing {self.short(request)}')
        # Split and clean the raw input
        split = [e.strip() for e in request.split('\r\n')]
        split = [e for e in split if len(e) > 0]
        # print('-' * 80)
        # print(split)
        # Parse the header
        header = split[0].split()
        parsed = dict(method=header[0], path=header[1], version=header[2])
        # Parser others
        for other in split[1:]:
            values = other.split(' ', 2)
            parsed[values[0]] = values[1]
        CONFIG.logger.debug(f'Parsed: {parsed}')
        return parsed

    def make_response(self,
                      resCode='HTTP/1.1 200',
                      resType='Content-Type: text/html',
                      resContent='Hello'):
        # Make up regular response
        resLength = 'Content-Length: {} \n'.format(
            len(self.encode(resContent)))
        chain = [self.encode(e) for e in [resCode,
                                          resType,
                                          resLength,
                                          resContent]]
        return b'\r\n'.join(chain)

    def default_icon(self):
        resType = 'Content-Type: image/x-icon'
        with open(os.path.join(default_src_dir, 'favicon.ico'), 'rb') as f:
            resContent = f.read()
        return self.make_response(resType=resType, resContent=resContent)

    def short(self, content, nums=(30, 30), keep_raw=False):
        # Short the [content] as [nums]
        # nums: The numbers of characters of leading and tailing
        try:
            content = content.__str__()
            content = ' '.join([e.strip() for e in content.split()])
            content.replace('\r\n', ' ')
        except Exception as e:
            # Return '' on error
            CONFIG.logger.error(f'Error while shorting {content}, error: {e}')
            return ''

        if keep_raw or len(content) < nums[0] + nums[1]:
            # Return raw if [keep_raw]
            return content
        else:
            # Return shorten [content]
            return '"{} ... {}"'.format(content[:nums[0]], content[-nums[1]:])
