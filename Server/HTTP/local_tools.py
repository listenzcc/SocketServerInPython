# File: local_tools.py
# Aim: Provide reuseable tools for the package


class Tools(object):
    def __init__(self, coding, buffer_size):
        self.coding = coding
        self.buffer_size = buffer_size

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

    def short(self, content, nums=(30, 30), keep_raw=False):
        # Short the content
        # nums: The numbers of characters of leading and tailing
        content = self.decode(content)
        content = ' '.join([e.strip() for e in content.split()])
        content.replace('\r\n', ' ')
        if keep_raw or len(content) < nums[0] + nums[1]:
            return content
        else:
            return '"{} ... {}"'.format(content[:nums[0]], content[-nums[1]:])
