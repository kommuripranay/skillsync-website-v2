// This list powers the dashboard
export const subjectList = [
  { id: 'java', name: 'Java', color: '#f89820' },
  { id: 'python', name: 'Python', color: '#3776AB' },
  { id: 'javascript', name: 'JavaScript', color: '#F7DF1E' },
  { id: 'react', name: 'React', color: '#61DAFB' },
  { id: 'docker', name: 'Docker', color: '#2496ed' },
  { id: 'aws', name: 'AWS', color: '#FF9900' },
  { id: 'sql', name: 'SQL', color: '#4479A1' },
  { id: 'kubernetes', name: 'Kubernetes', color: '#326CE5' },
  { id: 'cpp', name: 'C++', color: '#00599C' },
  { id: 'jenkins', name: 'Jenkins', color: '#D24939' },
];

// This object holds all mock questions, keyed by the 'id' from above
export const questionBank = {
  // --- Java ---
  java: [
    {
      id: 'j1',
      text: 'Which of the following is NOT a primitive data type in Java?',
      options: [
        { id: 'a', text: 'int' },
        { id: 'b', text: 'String' },
        { id: 'c', text: 'float' },
        { id: 'd', text: 'boolean' },
      ],
      correct: 'b',
    },
    {
      id: 'j2',
      text: 'What is the main purpose of a constructor in Java?',
      options: [
        { id: 'a', text: 'To initialize a new object' },
        { id: 'b', text: 'To destroy an object' },
        { id: 'c',text: 'To run the main method' },
        { id: 'd', text: 'To perform a calculation' },
      ],
      correct: 'a',
    },
    {
      id: 'j3',
      text: 'Which keyword is used to inherit a class in Java?',
      options: [
        { id: 'a', text: 'super' },
        { id: 'b', text: 'this' },
        { id: 'c', text: 'implements' },
        { id: 'd', text: 'extends' },
      ],
      correct: 'd',
    },
  ],
  // --- Python ---
  python: [
    {
      id: 'p1',
      text: 'What does the "self" keyword represent in Python class methods?',
      options: [
        { id: 'a', text: 'The class itself' },
        { id: 'b', text: 'The instance of the class' },
        { id: 'c', text: 'A global variable' },
        { id: 'd', text: 'A static variable' },
      ],
      correct: 'b',
    },
    {
      id: 'p2',
      text: 'Which data structure is defined by curly braces {} and holds key-value pairs?',
      options: [
        { id: 'a', text: 'List' },
        { id: 'b', text: 'Tuple' },
        { id: 'c', text: 'Dictionary' },
        { id: 'd', text: 'Set' },
      ],
      correct: 'c',
    },
  ],
  // --- JavaScript ---
  javascript: [
    {
      id: 'js1',
      text: 'What is the difference between "==" and "===" in JavaScript?',
      options: [
        { id: 'a', text: 'No difference, they are the same.' },
        { id: 'b', text: '"==" checks for value, "===" checks for value and type.' },
        { id: 'c', text: '"==" checks for value and type, "===" checks for value.' },
        { id: 'd', text: '"===" is for assignment, "==" is for comparison.' },
      ],
      correct: 'b',
    },
    {
      id: 'js2',
      text: 'Which of these is NOT a valid JavaScript variable name?',
      options: [
        { id: 'a', text: '_myVar' },
        { id: 'b', text: '$myVar' },
        { id: 'c', text: '1stVar' },
        { id: 'd', text: 'myVar1' },
      ],
      correct: 'c',
    },
  ],
  // --- React ---
  react: [
    {
      id: 'r1',
      text: 'What is JSX?',
      options: [
        { id: 'a', text: 'A JavaScript library for state management.' },
        { id: 'b', text: 'A syntax extension for JavaScript.' },
        { id: 'c', text: 'A CSS preprocessor.' },
        { id: 'd', text: 'A database query language.' },
      ],
      correct: 'b',
    },
    {
      id: 'r2',
      text: 'What hook would you use to manage state in a functional component?',
      options: [
        { id: 'a', text: 'useEffect' },
        { id: 'b', text: 'useState' },
        { id: 'c', text: 'useContext' },
        { id: 'd', text: 'useReducer' },
      ],
      correct: 'b',
    },
  ],
  // --- Docker ---
  docker: [
    {
      id: 'd1',
      text: 'What is a Docker "image"?',
      options: [
        { id: 'a', text: 'A running instance of a container.' },
        { id: 'b', text: 'A snapshot of a container.' },
        { id: 'c', text: 'A read-only template used to create containers.' },
        { id: 'd', text: 'A virtual machine.' },
      ],
      correct: 'c',
    },
    {
      id: 'd2',
      text: 'What command is used to build an image from a Dockerfile?',
      options: [
        { id: 'a', text: 'docker run' },
        { id: 'b', text: 'docker create' },
        { id: 'c', text: 'docker build' },
        { id: 'd', text: 'docker push' },
      ],
      correct: 'c',
    },
  ],
  // --- AWS ---
  aws: [
    {
      id: 'aws1',
      text: 'Which AWS service provides scalable computing capacity (virtual servers)?',
      options: [
        { id: 'a', text: 'S3' },
        { id: 'b', text: 'EC2' },
        { id: 'c', text: 'Lambda' },
        { id: 'd', text: 'RDS' },
      ],
      correct: 'b',
    },
    {
      id: 'aws2',
      text: 'What is the AWS service for object storage?',
      options: [
        { id: 'a', text: 'S3 (Simple Storage Service)' },
        { id: 'b', text: 'EBS (Elastic Block Store)' },
        { id: 'c', text: 'Glacier' },
        { id: 'd', text: 'DynamoDB' },
      ],
      correct: 'a',
    },
  ],
  // --- SQL ---
  sql: [
    {
      id: 'sql1',
      text: 'Which SQL keyword is used to retrieve data from a database?',
      options: [
        { id: 'a', text: 'GET' },
        { id: 'b', text: 'RETRIEVE' },
        { id: 'c', text: 'FETCH' },
        { id: 'd', text: 'SELECT' },
      ],
      correct: 'd',
    },
    {
      id: 'sql2',
      text: 'What does "JOIN" do in SQL?',
      options: [
        { id: 'a', text: 'Combines rows from two or more tables based on a related column.' },
        { id: 'b', text: 'Adds new data to a table.' },
        { id: 'c', text: 'Deletes data from a table.' },
        { id: 'd', text: 'Selects only unique values.' },
      ],
      correct: 'a',
    },
  ],
  // --- Kubernetes ---
  kubernetes: [
    {
      id: 'k1',
      text: 'What is the basic scheduling unit in Kubernetes?',
      options: [
        { id: 'a', text: 'Node' },
        { id: 'b', text: 'Service' },
        { id: 'c', text: 'Pod' },
        { id: 'd', text: 'Container' },
      ],
      correct: 'c',
    },
    {
      id: 'k2',
      text: 'What is a "Service" in Kubernetes?',
      options: [
        { id: 'a', text: 'A worker machine in the cluster.' },
        { id: 'b', text: 'An application running in a pod.' },
        { id: 'c', text: 'An abstract way to expose an application running on a set of Pods.' },
        { id: 'd', text: 'A configuration file.' },
      ],
      correct: 'c',
    },
  ],
  // --- C++ ---
  cpp: [
    {
      id: 'c1',
      text: 'What is a "pointer" in C++?',
      options: [
        { id: 'a', text: 'A variable that stores a data value directly.' },
        { id: 'b', text: 'A variable that stores the memory address of another variable.' },
        { id: 'c', text: 'A reference to a class.' },
        { id: 'd', text: 'A type of loop.' },
      ],
      correct: 'b',
    },
    {
      id: 'c2',
      text: 'What is the difference between "new" and "malloc"?',
      options: [
        { id: 'a', text: 'No difference, they are the same.' },
        { id: 'b', text: '"new" is a keyword, "malloc" is a function.' },
        { id: 'c', text: '"new" calls constructors, "malloc" does not.' },
        { id: 'd', text: 'Both b and c are correct.' },
      ],
      correct: 'd',
    },
  ],
  // --- Jenkins ---
  jenkins: [
    {
      id: 'jen1',
      text: 'What is Jenkins?',
      options: [
        { id: 'a', text: 'A version control system.' },
        { id: 'b', text: 'A container orchestration platform.' },
        { id: 'c', text: 'An open-source automation server for CI/CD.' },
        { id: 'd', text: 'A cloud computing platform.' },
      ],
      correct: 'c',
    },
    {
      id: 'jen2',
      text: 'What is a "Jenkinsfile"?',
      options: [
        { id: 'a', text: 'A text file that defines a Jenkins pipeline.' },
        { id: 'b', text: 'A server configuration file.' },
        { id: 'c', text: 'A user authentication file.' },
        { id: 'd', text: 'A plugin manifest.' },
      ],
      correct: 'a',
    },
  ],
};