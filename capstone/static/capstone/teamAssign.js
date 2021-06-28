

const csrf_token = document.querySelector('#csrf_token').innerHTML;

// ---------------------------------------------------------------

class TeamAssign extends React.Component{
    render() {
        return (<div>
            <div className={'war-bg-left-chose'} onClick={() => { this.updateTeam('Blue') }}>BLUE<br/>TEAM</div>
            <div className={'war-bg-right-chose'} onClick={() => { this.updateTeam('Red') }}>RED<br />TEAM</div>
        </div>)
    }

    updateTeam = (team) => {
        fetch(`set_to_team/${team}`, {
            method: 'PUT',
            headers: {
                "X-CSRFToken": csrf_token,
            }
        })
        .then(response => location.replace('/'))
    }
}

ReactDOM.render(<TeamAssign />, document.getElementById('teamAssign'));

