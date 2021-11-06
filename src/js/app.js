App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: () => App.initWeb3(),

  initWeb3: () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      )
      web3 = new Web3(App.web3Provider)
    }

    return App.initContract()
  },

  initContract: () => {
    $.getJSON('Election.json', (election) => {
      App.contracts.Election = TruffleContract(election)
      App.contracts.Election.setProvider(App.web3Provider)

      App.render()
    })
  },

  render: async () => {
    const loader = $('#loader')
    const content = $('#content')

    loader.show()
    content.hide()

    web3.eth.getCoinbase((err, account) => {
      if (err) {
        $('#account-address').html(`Failed to get your Account: ${err.message}`)
        return
      }

      App.account = account
      $('#account-address').html(`Your Account: ${account}`)
    })

    const candidatesResults = $('#candidate-results')
    candidatesResults.empty()

    const electionInstance = await App.contracts.Election.deployed()
    const candidatesCount = await electionInstance.candidatesCount()

    let promises = []
    for (let i = 1; i <= candidatesCount; i++) {
      promises.push(
        electionInstance.candidates(i).then((candidate) => {
          console.log(candidate)
          candidatesResults.append(`
            <tr>
              <td>${candidate[0].toNumber()}</td>
              <td>${candidate[1]}</td>
              <td>${candidate[2].toNumber()}</td>
            </tr>
          `)
        })
      )
    }

    try {
      await Promise.all(promises)
    } catch (err) {
      // TODO: handle this better
      console.error(err)
    }

    loader.hide()
    content.show()
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
