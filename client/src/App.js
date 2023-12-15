import io from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import shortid from 'shortid'; // Importujesz paczkę do generowania unikalnych id

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io('http://localhost:8000', { transports: ['websocket'] });
    setSocket(newSocket);
    newSocket.on('updateData', (updatedTasks) => {
      setTasks(updatedTasks);
    });

    newSocket.on('addTask', (newTask) => {
      addTask(newTask, false); 
    });

    newSocket.on('removeTask', (taskId) => {
      removeTask(taskId, false); 
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addTask = (newTask, emitEvent = true) => {
    setTasks(tasks => [...tasks, newTask]);

    if (emitEvent) {
      socket.emit('addTask', newTask);
    }
  };

  const removeTask = (taskId, emitEvent = true) => {
    setTasks(tasks => tasks.filter(task => task.id !== taskId));

    if (emitEvent) {
      socket.emit('removeTask', taskId);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();

    if (taskName === '') {
      return;
    }

    const newTask = {
      id: shortid.generate(),
      name: taskName,
    };

    addTask(newTask);
    setTaskName('');
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map(task => (
            <li className="task" key={task.id}>
              {task.name} <button className="btn btn--red" onClick={() => removeTask(task.id)}>Remove</button>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={submitForm}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
