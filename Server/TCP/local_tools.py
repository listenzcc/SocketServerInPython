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
