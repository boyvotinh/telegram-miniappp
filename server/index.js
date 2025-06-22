require('./bot'); // chạy file bot song song khi backend khởi động
const express = require('express');
const bodyParser = require('body-parser');
const taskRoutes = require('./routes/tasks');
const usersRouter = require('./routes/users');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const cors = require('cors')
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api/users', usersRouter);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/uploads', express.static('uploads'));
console.log("Teams routes mounted");
const port = 29651
app.listen(port, () => {
  console.log(`Server đang chạy ở cổng: ${port}`);
});
