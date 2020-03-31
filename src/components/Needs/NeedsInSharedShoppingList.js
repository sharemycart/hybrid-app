import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { inject, observer } from 'mobx-react';
import {NEEDS} from '../../constants/routes';

class NeedsInSharedShoppingList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            shoppingListUid: null,
            sharedShoppingList: null,
            sharingUser: null,
            isValid: false,
            loading: true
        }
    }

    async componentDidMount() {
        const { location } = this.props;
        const { pathname } = location;
        const shoppingListUid = pathname.replace('/share/', '')

        const snapshot = await this.props.firebase.list(shoppingListUid).get()
        const sharedShoppingList = snapshot.data();
        const sharingUser = sharedShoppingList
            ? (await this.props.firebase.user(sharedShoppingList.userId).get()).data()
            : null

        this.setState({
            shoppingListUid,
            sharedShoppingList,
            sharingUser,
            isValid: snapshot.exists,
            loading: false
        })
    }

    onCreateNeedsListForShoppingList(shoppingListUid, name) {
        this.props.firebase.createNeedsListForShoppingList(shoppingListUid, name)
            .then(() => {
                this.props.history.push(NEEDS)
            })
    }

    render() {
        const { loading, shoppingListUid, sharingUser, isValid } = this.state;

        return (
            <div id='needs-in-shared-shopping-list'>
                {loading && <div>Loading shared shopping list...</div>}

                {!loading && !isValid && <div>The list with id {shoppingListUid} does not exist</div>}

                {!loading && isValid && <div><div>you received shopping list {shoppingListUid} from {sharingUser.username}</div>

                    <span>
                        <button
                            type="button"
                            onClick={() => this.onCreateNeedsListForShoppingList(shoppingListUid, sharingUser.username)}
                        >
                            Add to my needs
                        </button>
                    </span>
                </div>

                }
            </div>
        )
    };
}

export default compose(
    withFirebase,
    inject('needsStore', 'sessionStore'),
    observer,
)(NeedsInSharedShoppingList);