import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import {DataGrid} from '@mui/x-data-grid';
import {SERVER_URL} from '../constants.js'

// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 
//

class Assignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: 0, assignments: [], open: false};
  };
 
  componentDidMount() {
    this.fetchAssignments();
  }

  handleClickOpen = () => {
    this.setState({ open:true });
  };

  handleClose = () => {
    this.setState({ open:false });
  };

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit = () => {
    this.addAssignment(this.state.assignmentName, this.state.dueDate, this.state.courseId);
    this.setState({ open:false });
  }

  addAssignment = (name, dueDate, courseId) => {
    console.log("Assignment.addAssignment");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/course/${courseId}/add`, 
      {  
        method: 'POST', 
        headers: { 
          'X-XSRF-TOKEN': token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({assignmentName: name, dueDate: dueDate})
      } )
    .then((response) => { 
      if (response.status == 200) {
        this.fetchAssignments();
        toast.success("Assignment added!", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      } else {
        toast.error("Add failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }        
    })
    .catch(err => console.error(err)); 
  }
 
  fetchAssignments = () => {
    console.log("Assignment.fetchAssignments");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/gradebook`, 
      {  
        method: 'GET', 
        headers: { 'X-XSRF-TOKEN': token }
      } )
    .then((response) => response.json()) 
    .then((responseData) => { 
      if (Array.isArray(responseData.assignments)) {
        //  add to each assignment an "id"  This is required by DataGrid  "id" is the row index in the data grid table 
        this.setState({ assignments: responseData.assignments.map((assignment, index) => ( { id: index, ...assignment } )) });
      } else {
        toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }        
    })
    .catch(err => console.error(err)); 
  }
  
  onRadioClick = (event) => {
    console.log("Assignment.onRadioClick " + event.target.value);
    this.setState({selected: event.target.value});
  }
  
  render() {
     const columns = [
      {
        field: 'assignmentName',
        headerName: 'Assignment',
        width: 400,
        renderCell: (params) => (
          <div>
          <Radio
            checked={params.row.id == this.state.selected}
            onChange={this.onRadioClick}
            value={params.row.id}
            color="default"
            size="small"
          />
          {params.value}
          </div>
        )
      },
      { field: 'courseTitle', headerName: 'Course', width: 300 },
      { field: 'dueDate', headerName: 'Due Date', width: 200 }
      ];
      
      const assignmentSelected = this.state.assignments[this.state.selected];
      const open = this.state.open;

      return (
          <div align="left" >
            <h4>Assignment(s) ready to grade: </h4>
              <div style={{ height: 450, width: '100%', align:"left"   }}>
                <DataGrid rows={this.state.assignments} columns={columns} />
              </div>                
            <Button component={Link} to={{pathname:'/gradebook',   assignment: assignmentSelected }} 
                    variant="outlined" color="primary" disabled={this.state.assignments.length===0}  style={{margin: 10}}>
              Grade
            </Button>
            <Button variant="outlined" color="primary"  style={{margin: 10}}
                    onClick={this.handleClickOpen}>
              Add
            </Button>
            <Dialog open={open} onClose={this.handleClose}>
                <DialogTitle>Add Assignment</DialogTitle>
                <DialogContent style={{paddingTop: 20}} >
                    <TextField autoFocus style = {{width:400}} label="Assignment Name" name="assignmentName" onChange={this.handleChange} /> 
                    <br/>
                    <br/>
                    <br/>
                    <TextField style = {{width:200}} label="Due Date" name="dueDate" onChange={this.handleChange} />
                    <br/>
                    <br/>
                    <br/>
                    <TextField style = {{width:200}} label="Course Id" name="courseId" onChange={this.handleChange} />
                </DialogContent>
                <DialogActions>
                  <Button color="secondary" onClick={this.handleClose}>Close</Button>
                  <Button id="Submit" color="primary" onClick={this.handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
            <ToastContainer autoClose={1500} /> 
          </div>
      )
  }
}  

export default Assignment;