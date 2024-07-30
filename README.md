# Genius

Project to try and explore shadcn components.

## Getting Started

```
cd new-project
npm install
npm run dev
```

## Getting Done

- [x] layouts
  - [x] navbar
  - [x] sidenav
- [ ] elements
  - [x] forms
  - [x] tables
  - [x] widgets
  - [ ] components
- [ ] examples
  - [x] auth
  - [x] empty
  - [ ] dasboard

## Docs

### Forms

Install command

```bash
npm install react-hook-form
npm install zod
npm install @hookform/resolvers
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

### Table

Install command

```bash
npm install @tanstack/react-table
npx shadcn-ui@latest add table
npx shadcn-ui@latest add select
```

### Deploy `gh-pages`

- change `basenameProd` in `/vite.config.ts`
- create deploy key `GITHUB_TOKEN` in github `/settings/keys`
- commit and push changes code
- setup gihub pages to branch `gh-pages`
# Genius-frontend
# genius-app



# QUESTION #1:

1. Describe the functionality of each function

    a/ _updateAvailableAssets():
    This function calculates and updates the available assets in the contract. It does this by:
      Calculating a reduction amount based on the total staked assets and the rebalance threshold.
      Determining the needed liquidity by subtracting this reduction from total staked assets.
      If total assets exceed the needed liquidity, it sets available assets as the difference.
      If not, it sets available assets to zero.
      It also updates the minAssetBalance to the needed liquidity amount.

    b/ _updateStakedBalance(uint256 amount, uint256 add):
    This function updates the total staked assets in the contract. It takes two parameters:
      - amount: The amount to add or subtract from the total staked assets.
      - add: A flag indicating whether to add (1) or subtract (0) the amount. It then increases or decreases totalStakedAssets    accordingly.

    c/ _updateBalance():
    This simple function updates the totalAssets variable by fetching the current balance of stables held by the contract.

    d/ _isBalanceWithinThreshold(uint256 balance):
    This function checks if a given balance is within the acceptable threshold and calculates a lower bound as a percentage of totalStakedAssets based on the rebalanceThreshold.
    Returns true if the provided balance is greater than or equal to this lower bound, false otherwise.



2. The last 3 functions are meant to be used together. In what order does it make sense to call each of them after a user has staked within the contract?

    After staking, Optimal order to call these functions would be:
      1 - _updateBalance();
      2 - _updateStakedBalance(amount, 1);
      3 - _updateAvailableAssets();


# QUESTION #2:

Thinking in the broader context of the contract that this function may exist in, can you come up with any possible exploits that this function would help facilitate. If so, describe how an attacker:

1. Is able to attack (What needs to happen before an attack is possible?)

  - For an attack to be possible:
    a/ The attacker needs to have the ability to call the function that uses _batchExecution() (using aggregate()).
    b/ The function must not have sufficient access controls or input validation.
    c/ The contract should have permissions to interact with other 

2. How the attack might occur?

  a/ Malicious Calls to transfer funds to the attacker's address /  approve spending of tokens to the attacker's address
  c/ The attacker calls the aggregate() function with these malicious parameters.
  d/ The _batchExecution() function executes all these calls in sequence, potentially draining funds or  compromising the contract's state.


3. What types of funds could be at risk
  a/ Any ETH, ERC20, ERC721 held by the contract
  b/ Access to any other contracts or protocols that this contract has permission to interact with


# QUESTION #3:

Differences from normal ERC20 allowances:
  Uses off-chain signatures instead of separate approval transactions
  Time-bound permissions
  Batched operations

Benefits for multi-step transactions:
  Gas efficiency
  Improved ux (single singature based "tx")

Safety improvements:
  Time-limited approvals reduce vulnerability window
  Easier revocation
  No need for unlimited approvals

What can go wrong?:
  Signature replay attacks (If the nonce is not properly incremented, an attacker may reuse a previously signed tx)
  Phishing vulnerabilities (Improved UX also means its that much easier for the user to sign malicious txs)
  Integration dependencies since contracts/tokens need to support it