

const csrf_token = document.querySelector('#csrf_token').innerHTML;
const user_team = document.querySelector('#user_team').innerHTML;
const is_user_logged = user_team !== "";

// ---------------------------------------------------------------

class CreateWarrior extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            current_state: 'operations'
        }
    }

    render() {
        return (<div className={user_team == "Red" ? "create-warrior-red" : "create-warrior-blue"}>
            {this.state.current_state == 'operations' &&
                < Operations updateCurrentState={this.updateCurrentState} />}
            {this.state.current_state == 'name' &&
                < NameWarrior />}
        </div>)
    }

    updateCurrentState = (state_name)  => {
        this.setState({
            current_state: state_name
        })
    }
}

// ---------------------------------------------------------------

class Operations extends React.Component {
    constructor(props) {
        super(props);
        const rnd1 = Array.from({ length: 10 }, () => Math.ceil(Math.random() * 10));
        const rnd2 = Array.from({ length: 10 }, () => Math.ceil(Math.random() * 10));
        this.state = {
            num1: rnd1,
            num2: rnd2,
            result: rnd1.map((num, idx) => {
                return num + rnd2[idx];
            }),
            passed: Array.from({ length: 10 }, () => false),
            errors: false
        }
    }

    render() {
        return (<div>Put effort into building your warrior!<br /><br />
            {this.state.errors && <div><div className={"errors"}>There are errors in your calculations! Try again!</div><br /></div>}
            {this.state.num1.map((num, idx) => <div key={idx} className={"operations"}><b>{num + " + " + this.state.num2[idx] + " = "}</b>
                <input className={"result-field"} type="number" id={"sum" + idx} name={"sum" + idx} min="1" max="20" onChange={evt => this.updateResultPass(idx, evt)} /><br /><br /></div>)}
            <button onClick={() => this.checkAndAdvance()} className={user_team == "Red" ? "create-warrior-button-red" : "create-warrior-button-blue"}>Continue</button><br /><br />
            {this.state.errors && <div className={"errors"}>There are errors in your calculations! Try again!</div>}
        </div>)
    }

    updateResultPass(idx, evt) {
        this.state.passed[idx] = evt.target.value == this.state.result[idx];
    }

    checkAndAdvance() {
        if (this.state.passed.some(elem => elem == false)) {
            this.setState({ errors: true })
        } else {
            this.props.updateCurrentState('name')
        }
    }
}

// ---------------------------------------------------------------

class NameWarrior extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warrior_name: ''
        }

    }
    render() {
        return (<div>Great! Name your warrior<br /><br />
            Name:<br />
            <input type="text" placeholder="Warrior Name" style={{ padding: "0vh 1vw" }} minLength="1" maxLength="32" onChange={evt => this.updateName(evt)}/><br/><br/>
            <button onClick={() => this.tryCreateWarrior()} className={user_team == "Red" ? "create-warrior-button-red" : "create-warrior-button-blue"} style={{ lineHeight: "4vw" }}>Create Warrior</button><br /><br />
        </div>);
    }

    updateName(evt) {
        this.state.warrior_name = evt.target.value;
    }


    tryCreateWarrior() {
        if (this.state.warrior_name.length > 0) {
            fetch('create_warrior', {
                method: 'PUT',
                body: JSON.stringify({ name: this.state.warrior_name }),
                headers: { "X-CSRFToken": csrf_token }
            })
                .then(response => location.replace('/')) 
        } else {
            console.log("ERROR");
        }
    }
}

ReactDOM.render(<CreateWarrior />, document.getElementById('CreateWarrior'));

