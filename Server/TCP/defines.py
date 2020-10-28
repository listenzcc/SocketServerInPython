# File: defines.py
# Aim: Defines components in TCP package

import socket
import threading
import traceback
from . import CONFIG, tools
CONFIG.logger.debug('Define components in TCP package')


class TCPServer(object):
    def __init__(self):
        self.connection_pool = []

    def get_connections(self):
        self.connection_pool = [
            e for e in self.connection_pool if e.is_connected]
        return self.connection_pool

    def start_pipeline(self):
        self.bind()
        self.serve()

    def bind(self):
        # Setup server and bind IP and port
        # Get IP and port
        IP = CONFIG.get('Server', 'IP')
        port = int(CONFIG.get('Server', 'port'))

        # Init server
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # Bind
        print(IP, port)
        self.server.bind((IP, port))
        CONFIG.logger.info(f'TCP server binds on {IP}:{port}')

    def serve(self):
        # Make server listen
        self.server.listen(1)
        CONFIG.logger.info(f'TCP server is listening')

        # Make server accept incoming connections
        thread = threading.Thread(
            target=self.accept_new_connection, name='TCP connection service')
        thread.setDaemon(True)
        thread.start()
        CONFIG.logger.info(f'TCP server is serving')

    def accept_new_connection(self):
        while True:
            # Wait until new client connection is established
            client, address = self.server.accept()
            # Generate new connection object
            connection = ClientConnection(client=client, address=address)
            connection.send('Hello from server')
            CONFIG.logger.info(
                f'New connection established: {client} at {address}')
            self.connection_pool.append(connection)


class ClientConnection(object):
    def __init__(self, client, address):
        self.client = client
        self.address = address
        self.start()
        self.is_connected = True

    def start(self):
        thread = threading.Thread(
            target=self.listen, name='Client listener in server')
        thread.setDaemon(True)
        thread.start()

    def onclose_func(self):
        # Onclose function of the client
        CONFIG.logger.info(
            f'Client is closed: {self.client} at {self.address}')

    def close(self):
        self.onclose_func()
        self.client.close()
        self.is_connected = False

    def listen(self):
        # Listen and handle incoming messages
        while True:
            try:
                # Wait until receive new incoming message
                income = self.client.recv(tools.buffer_size)
                CONFIG.logger.info(f'Received {income} from {self.address}')

                # If received empty, close the connection
                if income == b'':
                    # Received empty income message means closing the client connection
                    self.close()

                # Sendback response
                self.send(f'Message is received: {income}')

            except Exception as err:
                # Catch unexpected exception
                CONFIG.logger.error(f'Unexpected error occurres: {err}')
                # TODO: convert the traceback into logger error
                traceback.print_exc()
                self.close()
                break

    def send(self, message):
        message = tools.encode(message)
        self.client.sendall(message)
        CONFIG.logger.debug(
            f'Send {message} to {self.client} at {self.address}')
