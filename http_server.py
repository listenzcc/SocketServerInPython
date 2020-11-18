from Server.HTTP.server import HTTPServer
from Server.HTTP import CONFIG

src_dir = './Demos/X11_color_set'
src_dir = './Demos/Input_method'
CONFIG.set('Runtime', 'srcDir', src_dir)

server = HTTPServer()

if __name__ == '__main__':
    server.start_pipeline()
    while True:
        num = len(server.get_connections())
        prompt = f'Server ({src_dir}) >> '
        msg = input(prompt)

        if msg == 'q':
            break

        # if not msg == '':
        #     for c in server.get_connections():
        #         c.send(f'- | {msg} |', )  # encoding='ansi')
        #     continue

    print('ByeBye.')
