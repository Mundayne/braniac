# braniac
A simple, minimal bot framework for Discord.js

## Use
Braniac works through multiple command files placed in the `cmd/[group name]/` directory (see below for more info). 
It has chat keyword and spam filtering built in too.

### Commands
Commands are classes placed in their own files, all extending `Braniac.Command`. In the `cmd/` directory, you must create a 
sub-directory for each command group, then place command files inside these. When specifying the `name` and `group` properties 
of commands, `group` must be the name of the group folder, and `name` must be the file name. Two example commands are provided, one 
being a help command, the other pong.

A command class must have two functions: the constructor and a run function.

#### Constructor
The constructor must be passed the bot client. Inside the constructor, call `super` with the client as the first parameter and an 
options object as the second. The options object must have `name`, `group` and `description` properties; all the rest are optional 
but recommended. If a permission level is not specified, it defaults to anyone (`Braniac.Perms.member`).

#### Run
The run function will be executed as the command, it takes two arguments: `client` and `message`, client being the bot client and 
message being the message triggering the command.

### Configuration
Configuration is done in `config.js` - rename the provided example file and then edit it. You will need to add a sub-object for 
every guild the bot is part of. Just copy the provided one `x` number of times.

### Installation
To install the bot framework just open up a console window in the directory you wish the bot folder to be and run 
`npm install braniac && npm install`. This will install the Braniac framework and it's dependencies.

### Development
This framework is maintained by Discord user *Mundane#9887*. Join his support server [here](http://mundane.tk/discord).
