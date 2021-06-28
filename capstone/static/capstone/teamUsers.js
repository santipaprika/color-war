

const team_name = document.querySelector('#team_name').innerHTML;

// ---------------------------------------------------------------

class TeamUsersView extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loaded: false
        }
    }

    componentDidMount() {
        fetch(`/get_team_users/${team_name}`)
            .then(response => response.json())
            .then(users => {
                this.setState({
                    users: users,
                    loaded: true
                })
            })
    }

    render() {
        const { users, loaded } = this.state;
        if (!loaded) { return null; }

        console.log(users);
        return (<div className={team_name == "Red" ? "create-warrior-red" : "create-warrior-blue"}>
            <b>Members in team {team_name}</b>:
            {users.map((user, idx) =>
                <div className={'warrior-in-list'} key={idx} onClick={() => location.replace('/user_profile/'+user.id)}>
                    <b>{user.username}</b>: {user.warriors} warriors created &#160; | &#160; {user.contributions} contributions 
                </div>
            )}
        </div>)
    }

    updateCurrentState = (state_name)  => {
        this.setState({
            current_state: state_name
        })
    }
}

// ---------------------------------------------------------------

ReactDOM.render(<TeamUsersView />, document.getElementById('teamUsers'));

