# File: defines.py
# Aim: Defines components in HTTP package

import json
import socket
import threading
import traceback
from . import CONFIG, tools
CONFIG.logger.debug('Define components in HTTP package')


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
            # Generate new connection object
            connection = ClientConnection(client=client, address=address)
            # connection.send('Hello from server')
            CONFIG.logger.info(f'New connection established at {address}')
            self.connection_pool.append(connection)


class Request(object):
    # Easy-to-use request object,
    # used to manage the request.
    def __init__(self, request):
        # Init with the [request]
        # Regularize the request
        self.request = tools.decode(request)
        self.parsed = self.parse(self.request)

    def parse(self, request):
        # Parse the request
        CONFIG.logger.debug(f'Parsing {tools.short(request)}')
        # Split and clean the raw input
        split = [e.strip() for e in request.split('\r\n')]
        split = [e for e in split if len(e) > 0]
        # print('-' * 80)
        # print(split)
        # Parse the header
        header = split[0].split()
        parsed = dict(type=header[0], query=header[1], version=header[2])
        # Parser others
        for other in split[1:]:
            values = other.split(' ', 2)
            parsed[values[0]] = values[1]
        CONFIG.logger.debug(f'Parsed: {parsed}')
        return parsed


class ClientConnection(object):
    # Object of serving cliend connection,
    # used when client connectiono incomes
    def __init__(self, client, address):
        # Initialize
        # Setup connection values
        self.client = client
        self.address = address
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
            # !!! It may block the client listner if the connection is broken.
            income = self.client.recv(tools.buffer_size)
            CONFIG.logger.info(
                f'Received {tools.short(income)} from {self.address}')

            # If received empty, close the connection
            if income == b'':
                # Received empty income message means closing the client connection
                self.close()

            # Make response content
            content_code = b'HTTP/1.1 200 OK'

            content = income
            content_type = b'Content-Type: text/html'

            request = Request(income)
            content = json.dumps(request.parsed)
            content_type = b'Content-Type: application/json'

            # Sendback response
            # self.send(f'Message is received: {income}')
            content = tools.encode(content)
            self.send(b'\r\n'.join(
                [content_code, content_type, b'\r\n', content]))

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


# Init values
host = CONFIG.get('Server', 'IP')
port = int(CONFIG.get('Server', 'port'))
coding = CONFIG.get('Server', 'coding')


def main(host=host, port=port, coding=coding):
    # Echo server program
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, port))
        s.listen(1)
        while True:
            conn, addr = s.accept()
            with conn:
                print('Connected by', addr)
                data = conn.recv(1024)
                print(data)
                # conn.sendall(data)
                conn.send('\n'.join([
                    'HTTP/1.1 200 OK', 'Content-Type: text/html', '\n',
                    data.decode(coding)
                ]).encode(coding))


if __name__ == '__main__':
    main()