import React, { Component } from 'react';



export default class Card extends Component{

   


  render(){
      return(
        <div className="card clearfix">
        <div className="to-do-box">
            <img src="./45100.jpg"></img>
            <h1 className="Title">เฟิสอยากทำอะไรดี</h1>
            <div className="form-box">
            <table>
            <tr>
              <td><h2>work: </h2></td>
          </tr>
              </table>
              <br></br>

                <div className="list-box">
                <table>
                <tr><td>
                <h2>{this.state.arrList.map((value,index)=>
                  {
                    return(
                      <div key={index+value} className="list-item">
                      <div className="text-list">{value}</div>

                      </div>
                    );
                  })}</h2>
                  </td><td>
                  <h2>{this.state.arrStatus.map((value,index)=>
                    {
                      return(
                        <div key={index+value} className="list-item">
                        <table>
                        <tr><td>
                        <div className="text-list">{value}</div></td><td>
                          <div className="bb-action" onClick={this.deleteList.bind(this,index)}>x</div>
                          </td></tr>
                          </table>
                        </div>
                      );
                    })}</h2>

                    </td></tr>
                    </table>
                </div>

                <h3>Pass: {this.state.pass}</h3>
                <h3>Fail: {this.state.fail}</h3>

            </div>

        </div>

        </div>
      );
  }
}