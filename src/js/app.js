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

    const candidatesSelect = $('#candidates-select')
    candidatesSelect.empty()

    try {
      const electionInstance = await App.contracts.Election.deployed()
      const candidatesCount = await electionInstance.candidatesCount()

      const candidates = await Promise.all(
        new Array(candidatesCount.toNumber())
          .fill(0)
          .map((_, i) => electionInstance.candidates(i + 1))
      )

      for (let candidate of candidates) {
        candidatesResults.append(`
          <tr>
            <td>${candidate[0].toNumber()}</td>
            <td>${candidate[1]}</td>
            <td>${candidate[2].toNumber()}</td>
          </tr>
        `)
        candidatesSelect.append(
          `<option value="${candidate[0].toNumber()}">${candidate[1]}</option>`
        )
      }

      const hasVoted = await electionInstance.voters(App.account)
      if (hasVoted) {
        $('#vote-btn').attr('disabled', true)
      }
    } catch (err) {
      // TODO: handle this better
      console.error(err)
    }

    loader.hide()
    content.show()
  },

  castVote: async () => {
    const btn = $('#vote-btn')
    btn.attr('disabled', true)

    try {
      const electionInstance = await App.contracts.Election.deployed()
      const hasVoted = await electionInstance.voters(App.account)
      if (hasVoted) {
        return
      }

      const candidate = parseInt($('#candidates-select').val())

      await electionInstance.vote(candidate, { from: App.account })

      await App.render()
    } catch (err) {
      // TODO: handle this better
      console.error(err)
      btn.attr('disabled', false)
    }
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
