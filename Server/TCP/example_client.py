# File: example_client.py
# Aim: Define example of client connection

import socket
import threading
from . import CONFIG, tools

CONFIG.logger.debug('Define components in TCP package')


class ExampleClient(object):
    def __init__(self, IP, port):
        # Initialize and setup client
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)

        # Connet to IP:port
        client.connect((IP, port))
        name = client.getsockname()

        # Report and set attributes
        CONFIG.logger.info(
            f'Client {name} is connected to server at {IP}:{port}')
        self.client = client
        self.name = name

    def listen(self):
        # Listen to the server
        CONFIG.logger.info(f'Client {self.name} starts listening')
        while True:
            # Wait until new message is received
            income = self.client.recv(tools.buffer_size)
            CONFIG.logger.info(f'Received {income} from server')

    def start(self):
        # Start client connection to server
        thread = threading.Thread(
            target=self.listen, name='TCP connection client')
        thread.setDaemon(True)
        thread.start()
        CONFIG.logger.info(f'Client starts listening')

        # Say hello to server
        self.send(f'Hello from client {self.name}')

    def send(self, message):
        # Send [message] to server
        message = tools.encode(message)
        self.client.sendall(message)
        CONFIG.logger.debug(f'Sent {message} to server')
