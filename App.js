import {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';

let i = 25;

function Section({iids, instructor_db, changes, lookup, delItem}){
  const clicked = e => {
    changes(iids.id, e.target.value);
  };

  const dels = e =>{
    delItem(e.target.id);
  };

  //console.log("this is lookup: ", lookup);
  
  return(

    <div className="col-auto">
        <div className="input-group">
            <select className="form-select" defaultValue={lookup.id} onChange={clicked}>
              {instructor_db.map(idInst =><option value={idInst.id} >{idInst.name}</option>)}
            </select>
            <button className="btn btn-danger" id={iids.id} onClick={dels}>-</button>
        </div>
    </div>
  );
};

function Course({thisID, name,initial_instructor_ids,all_instructors,thisSecID}) {
  const [instructor_ids, setInstructorIds] = useState(initial_instructor_ids);

  const [updateSectionID, setSectionID] = useState(thisSecID);

  const updating = () => setSectionID(updateSectionID => updateSectionID + 1);
  //const addBulbs = () => setCount(count => count + 1);

  const addSection = e => {
    const updateSection = async () =>{
      console.log("....sending ajax add section call");
      console.log(parseInt(e.target.value));
      thisSecID = thisSecID + 1;
      //updating();
      console.log("thisSecID: ",thisSecID)
      const result = await axios.post('http://localhost:8080/add_section',{
        sectionID: thisSecID, sectionCourse: thisID, sectionInstructor: parseInt(e.target.value)
      });
      if(result.data.status === "OK"){
        console.log("....add section succeeded");
        setInstructorIds([...instructor_ids, {id: thisSecID, course_id: thisID, instructor_id: parseInt(e.target.value)}]);
      }
      else{
        console.log("....add section failed");
        console.log(result.data.status);
      }
    };
    updateSection();
    i++;
  };
  const updateInstructor = (id,updated_instructor_id) =>{
    console.log(id);
    const UpdateInstructor = async () =>{
      console.log("....sending ajax update instructor call");
      const result = await axios.post('http://localhost:8080/update_instructor',{
        instructorID: updated_instructor_id, updateID: id
      });
      if(result.data.status === "OK"){
        console.log("....update instructor succeeded");
        setInstructorIds(instructor_ids.map(lookup => lookup.id === id ? {...lookup, instructor_id: parseInt(updated_instructor_id)}: lookup));
      }
      else{
        console.log("....update instructor failed");
        console.log(result.data.status);
      }
    };
    UpdateInstructor();
    
  }
  const deleteInstructor = (index) =>{
    console.log(index);
    const DeleteInstructor = async () =>{
      console.log("....sending ajax delete instructor call");
      const result = await axios.post('http://localhost:8080/delete_section',{
        deleteID: index
      });
      if(result.data.status === "OK"){
        console.log("....delete instructor succeeded");
        setInstructorIds(instructor_ids.filter(item => item.id !== parseInt(index)));
      }
      else{
        console.log("....delete instructor failed");
        console.log(result.data.status);
      }
    };
    DeleteInstructor();

  };

  //console.log(instructor_ids);

  if(instructor_ids == null)
  {
    return(<h1>it is null</h1>);
  }

  return (
    <tr>
        <th scope="row">{name}</th>
        <td>
            <div className="row g-2">
                {instructor_ids.map((iid,i) =>
                 <div className="col-auto" key={i}>
                  {<Section instructor_db={all_instructors} iids={iid} changes={updateInstructor} delItem ={deleteInstructor} lookup={all_instructors.find(inst => inst.id === iid.instructor_id)}/>}
                  </div>)}
              <div className="col-auto">
                <select className="form-select" defaultValue="-1" onChange={addSection}>
                    <option disabled value="-1" >Add Section...</option>
                    {all_instructors.map(inst =>  <option key={inst.id} value={inst.id} >{inst.name}</option>)}
                </select>
                </div>
            </div>
          </td>
      </tr>
  ); 
}

function App() {
  const [loading,setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realInstructors, setIDs] = useState();
  const [NewCourses, setCourseID] = useState();

  const addCourses = (CourseID, e) => {
    e.preventDefault();
    const updateCourses = async () => {
      try{
        console.log("....sending ajax update course call");
        console.log(parseInt(e.target.addCourse.value));
        CourseID = CourseID + 1;
        console.log(CourseID);
        const result = await axios.post('http://localhost:8080/add_course',{
          newID: CourseID, newName: parseInt(e.target.addCourse.value)
        });
        if(result.data.status === "OK"){
          console.log("....update course succeeded");
          setCourseID([...NewCourses, {id: CourseID ,name: parseInt(e.target.addCourse.value), sections: []}]);
        }
        else{
          console.log("....update course failed");
          console.log(result.data.status);
        }
      }catch (error){
        setError("....update course failed",error);
      }
    };
    updateCourses();
  };

  console.log("Rendering app");
  useEffect(() => {
    const fetch = async () => {
      try{
        console.log("....sending ajax call");
        setLoading(true);
        const result = await axios('http://localhost:8080/data');
        console.log("...data has returned");
        setLoading(false);
        setCourseID(result.data.newCourses);
        setIDs(result.data.instructors)
      }catch (error){
        setLoading(false);
        setError("Unable to retrieve data from server", error);
      }
    };
    fetch();

  },[]);
  console.log(".....Rendering");
  

  if (NewCourses == null || realInstructors == null)
  {
    return(<h2>no data</h2>)
  }

  if(NewCourses != null && realInstructors != null)
  {
    const courseID = NewCourses[NewCourses.length - 1].id
    const sec = NewCourses.filter(it => it.sections.length !== 0);
    //console.log("this is sec: ", sec);
    const sec3 = sec.map(({sections}) => sections.map(p => p.id));
    //console.log(sec3);
    const sec4 = sec3.map(p => Math.max(...p))
    console.log(sec4);
    const secID = Math.max(...sec4);


    return (
      <>
        {loading
        ?
        <h2>Loading...</h2>
        : error ?
        <div>
          <h2>Error</h2>
          <pre>{error}</pre>
        </div>
        :
        <body>
            <div className="container">

            <h1>Build-A-Schedule</h1>

            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Course</th>
                        <th scope="col">Sections</th>
                    </tr>
                </thead>
                <tbody>
                  {NewCourses.map(({id,name, sections}) => <Course key={id} thisSecID={secID} thisID={id} name={name} all_instructors={realInstructors} initial_instructor_ids={sections}/>)}
                </tbody>
            </table>
            <form onSubmit={e => addCourses(courseID, e)}>
            <div className="row">
              <div className ="col-auto">
                  <div className="input-group mb-3">
                      <input type="text" className="form-control" placeholder="Course Number" id='addCourse'/>
                      <button type="submit" className="btn btn-primary" id="button-addon2" >Add Course</button>
                  </div>
              </div>
            </div>
            </form>

            </div>

        </body>}
      </>
    );}
}

export default App;