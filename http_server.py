from Server.HTTP.server import HTTPServer

server = HTTPServer()

if __name__ == '__main__':
    server.start_pipeline()
    while True:
        num = len(server.get_connections())
        prompt = f'Server ({num}) >> '
        msg = input(prompt)

        if msg == 'q':
            break

        # if not msg == '':
        #     for c in server.get_connections():
        #         c.send(f'- | {msg} |', )  # encoding='ansi')
        #     continue

    print('ByeBye.')
