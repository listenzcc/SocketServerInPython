# File: defines.py
# Aim: Defines components in HTTP package

import json
import socket
import threading
import traceback
from . import CONFIG
from .local_tools import Tools
from .worker import Worker
tools = Tools()
CONFIG.logger.debug('HTTP server imported in HTTP package')

worker = Worker()


class HTTPServer(object):
    # HTTPServer object
    def __init__(self):
        # Initialize
        self.connection_pool = []

    def get_connections(self):
        # Get valid connections,
        # used to discard invalid connections
        # Discard invalid connections
        self.connection_pool = [
            e for e in self.connection_pool if e.is_connected
        ]
        # Return valid connections
        return self.connection_pool

    def start_pipeline(self):
        # The pipeline to start the server
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
        self.server.bind((IP, port))
        CONFIG.logger.info(f'HTTP server binds on {IP}:{port}')

    def serve(self):
        # Make server listen
        self.server.listen(1)
        CONFIG.logger.info(f'HTTP server is listening')

        # Make server accept incoming connections
        thread = threading.Thread(target=self.accept_new_connection,
                                  name='HTTP connection service')
        thread.setDaemon(True)
        thread.start()
        CONFIG.logger.info(f'HTTP server is serving')

    def accept_new_connection(self):
        while True:
            # Wait until new client connection is established
            client, address = self.server.accept()
            buffer_size = int(CONFIG.get('Server', 'bufferSize'))
            # Generate new connection object
            connection = ClientConnection(
                client=client, address=address, buffer_size=buffer_size)
            # connection.send('Hello from server')
            CONFIG.logger.info(f'New connection established at {address}')
            self.connection_pool.append(connection)
            self.get_connections()


class ClientConnection(object):
    # Object of serving client connection,
    # used when client connection incomes
    def __init__(self, client, address, buffer_size):
        # Initialize
        # Setup connection values
        self.client = client
        self.address = address
        self.buffer_size = buffer_size
        # Start serving
        self.start()
        self.is_connected = True

    def start(self):
        # Start serving
        thread = threading.Thread(target=self.listen,
                                  name='Client listener in server')
        thread.setDaemon(True)
        thread.start()

    def onclose_func(self):
        # Onclose function of the client
        CONFIG.logger.info(f'Client is closed: {self.address}')

    def close(self):
        # Close the connection
        self.onclose_func()
        self.client.close()
        self.is_connected = False

    def listen(self):
        # Listen and handle incoming messages
        try:
            # Wait until receive new incoming message
            # !!! It may block the client listener if the connection is broken.
            income = self.client.recv(self.buffer_size)
            CONFIG.logger.info(
                f'Received {tools.short(income)} from {self.address}')

            # If received empty, close the connection
            if income == b'':
                # Received empty income message means closing the client connection
                self.close()
                # Return to escape the function
                return

            # Parse request
            parsed_request = tools.parse_request(income)

            # if parsed_request['method'] == 'GET' and parsed_request['path'] == '/favicon.ico':
            #     self.send(tools.default_icon())
            #     return

            # res_params = dict(resType='Content-Type: application/json',
            #                   resContent=json.dumps(parsed_request))
            # self.send(tools.make_response(**res_params))
            self.send(worker.response(parsed_request))

        except Exception as err:
            # Catch unexpected exception
            CONFIG.logger.error(f'Unexpected error occurres: {err}')
            # TODO: convert the traceback into logger error
            traceback.print_exc()

        finally:
            self.close()

    def send(self, message):
        # Sending message method
        message = tools.encode(message)
        self.client.sendall(message)
        CONFIG.logger.debug(f'Send {tools.short(message)} to {self.address}')
