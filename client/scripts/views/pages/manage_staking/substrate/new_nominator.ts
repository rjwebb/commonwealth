import m from 'mithril';
import app from 'state';
import { formatAddressShort } from 'helpers';
import Substrate from 'controllers/chain/substrate/main';
import { makeDynamicComponent } from 'models/mithril';
import User from 'views/components/widgets/user';
import { IValidators, SubstrateAccount } from 'controllers/chain/substrate/account';
import { ICosmosValidator } from 'controllers/chain/cosmos/account';
import { StakingLedger } from '@polkadot/types/interfaces';
import StashAccountForm from 'views/pages/validators/substrate/stash_form';
import ControllerAccountForm from 'views/pages/validators/substrate/controller_form';
import Bond from 'views/pages/manage_staking/substrate/bond';

interface NewNominatorState {
  dynamic: {
  }
}

interface NewNominatorAttrs {
}

const model = {
  error: true,
  payload: {},
  onChange: (payload, noError: boolean) => {
    console.log(noError);
    model.payload = payload;
    model.error = !noError;
  }
};

const NewNominator = makeDynamicComponent<NewNominatorAttrs, NewNominatorState>({
  getObservables: () => ({
    groupKey: app.chain.class.toString()
  }),
  view: (vnode) => {
    return m('.NewNominator', [
      m('.compact-modal-title.center-lg', [
        m('h5', [ 'Step 1 of 2' ]),
        m('h3', [ 'Setup Nominator' ]),
      ]),
      m('.compact-modal-body',
        m(Bond, {
          onChange: model.onChange
        }),
        m('div.center-lg.padding-t-10',
          m('button.cui-button.cui-align-center.cui-primary', {
            disabled: model.error,
            onclick: () => {},
          }, 'Next')))
    ]);
  },
});

export default NewNominator;
