import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Grid,
  tableSortLabelClasses,
} from "@mui/material";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State to hold the list of tasks.
  const [tasks, setTasks] = useState([]);

  // State for the task name being entered by the user.
  const [taskName, setTaskName] = useState("");

  const backend = `${process.env.REACT_APP_BACKEND}/tasks`;

  // Gets the token and the tasks for the current user whenever updated
  useEffect(() => {
    if (user) {
      getTasks(user);
    } else {
      navigate('/login');
    }
  }, [user])


  // TODO: Support retrieving your todo list from the API.
  // Currently, the tasks are hardcoded. You'll need to make an API call
  // to fetch the list of tasks instead of using the hardcoded data.
  function getTasks(user) {
    fetch(`${backend}/${user.email}`, {
      headers: {
        "Authorization": `Bearer ${user.accessToken}`
      }
    })
    .then(response => response.json())
    .then(response => {
      const allTasks = [];
      response.forEach(task => allTasks.push({id: task.id, name: task.name, finished: task.finished}));
      setTasks(allTasks);
    })
  }

  function addTask() {
    // Check if task name is provided and if it doesn't already exist.
    if (taskName && !tasks.some((task) => task.name === taskName)) {

      // TODO: Support adding todo items to your todo list through the API.
      // In addition to updating the state directly, you should send a request
      // to the API to add a new task and then update the state based on the response.
      fetch(`${backend}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          "user": user.email,
          "name": taskName,
          "finished": false
        })})
        .then((response) => {
          if (response.ok) {
            setTasks([...tasks, {id: response.id, name: taskName, finished: false}]);
          }
        });
      
      setTaskName("");
    } else if (tasks.some((task) => task.name === taskName)) {
      alert("Task already exists!");
    }
  }

  // Function to toggle the 'finished' status of a task.
  function updateTask(name) {
    // TODO: Support removing/checking off todo items in your todo list through the API.
    // Similar to adding tasks, when checking off a task, you should send a request
    // to the API to update the task's status and then update the state based on the response.
    fetch(`${backend}/${name.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${user.accessToken}`
    }})
    .then(response => {
      const unfinished = tasks.filter(task => task.id !== name.id);
      setTasks(unfinished);
    })
  }


  // Function to compute a message indicating how many tasks are unfinished.
  function getSummary() {
    const unfinishedTasks = tasks.filter((task) => !task.finished).length;
    return unfinishedTasks === 1
      ? `You have 1 unfinished task`
      : `You have ${unfinishedTasks} tasks left to do`;
  }

  return (
    <>
      <Header />
      <Container component="main" maxWidth="sm">
        {/* Main layout and styling for the ToDo app. */}
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Display the unfinished task summary */}
          <Typography variant="h4" component="div" fontWeight="bold">
            {getSummary()}
          </Typography>
          <Box
            sx={{
              width: "100%",
              marginTop: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Input and button to add a new task */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small" // makes the textfield smaller
                  value={taskName}
                  placeholder="Type your task here"
                  onChange={(event) => setTaskName(event.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addTask}
                  fullWidth
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            {/* List of tasks */}
            <List sx={{ marginTop: 3 }}>
              {tasks.map((task) => (
                <ListItem
                  key={task.name}
                  dense
                  onClick={() => updateTask(task)}
                >
                  <Checkbox
                    checked={task.finished}
                  />
                  <ListItemText primary={task.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Container>
    </>
  );
}
