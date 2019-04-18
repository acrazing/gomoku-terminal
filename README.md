# gomoku-terminal

A terminal gomoku online game based on React & ink.

![gomoku-demo](./assets/gomoku-demo.gif)

## Install

```bash
# var npm
npm i -g gomoku-terminal

# yarn
yarn global add gomoku-terminal

```

## Usage

```bash
$ gomoku --help
gomoku [options]

Options:
  --version  Show version number                                       [boolean]
  --api      the api host        [string] [default: "http://23.106.139.99:5001"]
  --store    the config & session store file
                                   [string] [default: "~/.gomoku-terminal.json"]
  --help     Show help                                                 [boolean]
```

**Notes**

1. If you want to start two or more instance, please pass the `--store` argument with different filename.
2. You can use arrow keys to control focused button/input/piece, or use shortcut keymap to control button.
3. Currently for some internal bugs, you can only use existed users or login anonymous. The users exists(username/password):
   - kcats01/pass_01
   - kcats02/pass_02
   - kcats03/pass_03
   - kcats04/pass_04
4. Some words from server is Chinese, please ignore it~

## LICENSE

[MIT](./LICENSE)
