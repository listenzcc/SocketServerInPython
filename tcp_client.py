from Server.TCP.example_client import ExampleClient

client = ExampleClient('localhost', 63365)

if __name__ == '__main__':
    client.start()
    while True:
        msg = input('Client >> ')

        if msg == 'q':
            break

        if not msg == '':
            client.send(msg)

    print('ByeBye.')
