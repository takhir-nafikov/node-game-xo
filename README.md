# Game XO API
### New Game

For a create game, you would send a POST request on `/new_game`.
Field size must be less than 10.

**request :**
```
{
    name: <String>,
    size: <Integer>
}
```

**response :**
``` 
{
    status: 'ok', 
    accessToken: <String>,
    gameToken: <String>
}
```

### Join Game
For a join in ga,e , you would send a POST request on `/join_game`. 

**request :**
```
{
    name: <String>,
    gameToken: <String>
}
```

**response :**
```
{
    status: 'ok', 
    accessToken: <String> 
}
```
Token need indicates in the header at `x-access-token: accessToken` for an operation which requires authentication.


### Get State
For get info about game send GET request on `/state/:gameToken`.
Need indicate token in headers.

**response :**
```
{
    status: 'ok',
    turn: <String>,
    duration: <Int(milliseconds)>,
    field: <Array of Arrays>,
    winner: <String>
}
```

### Move
To make a move you need to send POST request on `/make_move`.
Need indicate token in headers.

**request :**
```
{
    gameToken: <String>,
    row: <Int>,
    col: <Int>
}
```

**response :**
```
{
    status: 'ok',
    winner: <String>
}
```
