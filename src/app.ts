import express, { Request, Response } from "express";


const app = express();

// parser
app.use(express.json());


// "/" -> localhost:5000/
app.get('/', (req: Request, res: Response)=> {
    res.status(200).json({
        Message : 'This is root route',
        path: '/'
    })
})


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
