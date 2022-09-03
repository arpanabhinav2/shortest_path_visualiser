import React, { useEffect, useState } from 'react';
import {
    Container, Grid, Button, Box, Slider,
} from "@material-ui/core";
import "./main.css";
import Node from "../pfv/node/node.jsx"
import { GenerateGrid, GenerateRandomWalls , RemoveWeights} from "./helpers.jsx"

import { Djisktra } from "./algortihms/Djisktra";
import { BFS } from "./algortihms/BFS";
import { DFS } from "./algortihms/DFS"
import { GameOfLife } from "./algortihms/GameOfLife";
import { AlgoDescription, AlgoName, isWeighted } from "../pfv/algortihms/data";
import { row } from './algortihms/helpers';

var rows = 17, cols = Math.floor((document.body.clientWidth - 55) / 40) - 1;

const App = (() => {
    const wall_weight = 1e6;
    const [grid, setGrid] = useState(GenerateGrid(rows, cols));
    const [start, setStart] = useState(true);
    const [position, setPosition] = useState([0, rows * cols - 1]);
    const [pressed, setPressed] = useState(false);
    const [weight, setWeight] = useState(wall_weight);
    const [Description, setDescription] = useState("");
    const [startGame , setStartGame] = useState(false);
    const [isAnimation , setIsAnimation] = useState(false);

    document.title = "Path Finding Visualizer";
    const AlgoCall = {
        Djisktra: Djisktra(rows, cols, position[0], position[1], grid),
        BFS: BFS(rows, cols, position[0], position[1], grid),
        DFS: DFS(rows, cols, position[0], position[1], grid),
    };

    const handlechange = (idx) => {
        let array = position.slice();
        if (start) array[0] = idx;
        else array[1] = idx;
        setPosition(array);
    };

    const handlewalls = (idx) => {
        if (pressed && !isAnimation) {
            let newgrid = grid.slice();
            newgrid[idx].Weight = weight;
            setGrid(newgrid);
        }
    };

    async function Animate(Arr, i, key) {
        if (i == Arr.length) return true;
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let newgrid = grid.slice();
                newgrid[Arr[i]][key] ^= true;
                setGrid(newgrid);
                resolve(true);
            }, document.getElementById("time").value);
        });
        if (await myPromise) {
            return Animate(Arr, i + 1, key);
        }
    };

    async function AnimateVisitedOrder(Order, shortestpath) {
        setIsAnimation(true);
        let myPromise = new Promise((resolve, reject) => {
            resolve(Animate(Order, 0, "isVisited"));
        });
        if (await myPromise) {
            Animate(shortestpath, 0, "isPath");
        }
        setIsAnimation(false);
    };

    async function AnimateGameOfLife(){
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(grid);
                let new_grid = GameOfLife(grid , rows , cols);
                setGrid(new_grid);
                resolve(true);
            } , document.getElementById("time").value);
        });
        if(await myPromise){
            AnimateGameOfLife();
        }
    };

    async function initGame(){
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                setStartGame(true);
                let new_grid = GenerateRandomWalls(grid);
                setGrid(new_grid);
                console.log(grid);
                resolve(true);
            },1000);
        });
        if(await myPromise){
            AnimateGameOfLife();
        }
    }

    const RunAlgo = (key) => {
        if(!isWeighted[key]){
            let new_grid = RemoveWeights(grid);
            setGrid(new_grid);
        }
        if(key=="GameOfLife"){
            initGame();
            return;
        }
        const [Order, shorteshtpath] = AlgoCall[key];
        setDescription(AlgoDescription[key]);
        AnimateVisitedOrder(Order, shorteshtpath);
    };

    return (
        <section >
            <Container maxWidth="xl" className="container">
                <Grid container justify="center" >
                    <Grid item md={4} className="item">
                        <p>Select and double click on Grid to Change start and end positions</p>
                        <Box m={1}>
                            <Button
                                onClick={() => setStart(true)}
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled = {isAnimation}
                            >
                                Choose Start Point</Button>
                        </Box>
                        <Box m={1}>
                            <Button
                                onClick={() => setStart(false)}
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled = {isAnimation}
                            >
                                Choose End Point</Button>
                        </Box>
                        <Box m={1}>
                            <Button
                                onClick={() => setGrid(GenerateGrid(rows,cols))}
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled = {isAnimation}
                            >
                            Reset</Button>
                        </Box>
                    </Grid>
                    <Grid item md={4} className="item">
                        <p>Click and drag to create walls and Weights</p>
                        <Box m={1}>
                            <Button
                                onClick={() => setWeight(wall_weight)}
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled = {isAnimation}
                            >
                                Set Walls</Button>
                        </Box>
                        <Grid container padding={1}>
                            <Grid item xs={6}>
                                <p>Weight of nodes to assign</p>
                                <input
                                    type="range"
                                    max="20"
                                    min="2"
                                    id="weight"
                                    onChange={() => setWeight(document.getElementById("weight").value)}
                                    disabled = {isAnimation}
                                ></input>
                            </Grid>
                            <Grid item xs={6}>
                                <p>Speed of Animation</p>
                                <input
                                    type="range"
                                    max="5000"
                                    min="50"
                                    id="time"
                                ></input>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={3} className="item">
                        <p>Choose one of the following Algorithms</p>
                        <Grid container>
                            {Object.keys(AlgoName).map(e => (
                                <Grid item xs={6} key={e}>
                                    <Button
                                        onClick={() => RunAlgo(e)}
                                        color="primary"
                                        size="small"
                                        disabled = {isAnimation}
                                    >
                                    {e}</Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
            <div style={{ width: (cols) * 42 }} className="grid">
                {grid.map(e => (
                    <div
                        onDoubleClick={() => handlechange(e.idx)}
                        onMouseDown={() => setPressed(true)}
                        onMouseUp={() => setPressed(false)}
                        onMouseEnter={() => handlewalls(e.idx)}
                    >
                        <Node
                            key={e}
                            idx={e.idx}
                            isVisited={e.isVisited}
                            isPath={e.isPath}
                            Weight={e.Weight}
                            isStart={position[0] === e.idx && !startGame}
                            isEnd={position[1] === e.idx && !startGame}
                            pressed={pressed}
                        />
                    </div>
                ))}
                <p>Description: {Description}</p>
            </div>
        </section>
    );
});
export default App;