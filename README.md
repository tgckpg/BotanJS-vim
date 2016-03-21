# BotanJS-vim
This is a functional vim using the *screen buffer* approach. What I am trying to do is to achieve that smooth-vim-feeling as close as possible to the original Vim in a general terminal.

Visit the demo over [here](https://tgckpg.github.io/BotanJS-vim)

## This is still working in progress
The below commands are currently working. ( will be updated if I remembered, might not be synced with the demo )
```
Cursor movements
hjkl
G

INSERT:
aA i

commands that starts with g:
gg
g8

VISUAL:
v ( hightlight only )

Undo / Redo: ( might have bugs, please file issue if bugged. But I think I will finish other features first if it is not very critical )
u / Ctrl + r

```

### How it works
By *screen buffer*, it means that the textarea is treated as a screen buffer. You are not directly interacting with the textarea. Instead you type into the script, then the result is *rendered* through the textarea.

### Why use screen buffer?
By treating the textarea as a *screen*. I could archive almost everything except for coloring. And it is easier to precisely track the cursor this way.

Visit this [blog](https://blog.astropenguin.net/article/view/vimarea-day-1-hjkl/) entries for more information.

### How the source code works
This is based on a framework I wrote called BotanJS. Which is a frontend framework & Service API that is so big that I am too busy ( lazy ) to explain. If you are only interested in the Vim itself only. It is recommended to download the compiled source code provided in the demo site above.

If you are also interested in [BotanJS](https://github.com/tgckpg/BotanJS). Please head to the project page [here](https://github.com/tgckpg/BotanJS). *Warning*, it might NOT be easy to understand.

### I made this
You made this? I made this.
Because I LOVE Vim, and [wasavi](https://github.com/akahuku/wasavi) in firefox does not work for me. I know peoples are busy so fuck me I am going to make one myself, alright?

### Use wasavi if you can
#### [wasavi! wasavi! wasavi!](https://github.com/akahuku/wasavi)
[wasavi](https://github.com/akahuku/wasavi) is so good! This is a must-have plugin in Google Chrome. If you haven't heard of that yet seriously go use it now!

I tried porting it into the browser tho. But I am too stupid to do that. But still I highly recommend using it.

### How can I contribute?
First, you need to understand the framework behind it. Then file a merge request. Sounds easy right?... prepare to DIEEE!
