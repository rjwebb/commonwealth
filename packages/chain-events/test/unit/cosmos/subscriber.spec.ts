import chai from 'chai';

import { Subscriber } from '../../../src/chains/cosmos/subscriber';
import { RawEvent } from '../../../src/chains/cosmos/types';

import { getApi } from './util';

const { assert } = chai;

const tx1 = `0a530a510a1b2f636f736d6f732e676f762e763162657461312e4d7367566f7465123208d102122b6f736d6f3167636633666875647538366c643639636c666c647232786c376b796c6e686b78386870376534180112670a510a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103debe31f3c725ac37d9250df0c3fec332701a3bfbf9ab86285153c41b9c0ab80412040a02080118dc0412120a0c0a05756f736d6f120331383510fcc0041a406a4cc2b1a71732186cca4a8137f83720c5ea99406328cc2b93284f0370169a4262961a5d26229dad558ee59d71e23fbede6e0b5ca861dd8b24813092df29f5ce`;
const tx1Decoded = `{"authInfo":{"signerInfos":[{"sequence":{"low":604,"high":0,"unsigned":true},"publicKey":{"typeUrl":"/cosmos.crypto.secp256k1.PubKey","value":{"0":10,"1":33,"2":3,"3":222,"4":190,"5":49,"6":243,"7":199,"8":37,"9":172,"10":55,"11":217,"12":37,"13":13,"14":240,"15":195,"16":254,"17":195,"18":50,"19":112,"20":26,"21":59,"22":251,"23":249,"24":171,"25":134,"26":40,"27":81,"28":83,"29":196,"30":27,"31":156,"32":10,"33":184,"34":4}},"modeInfo":{"single":{"mode":1}}}],"fee":{"gasLimit":{"low":73852,"high":0,"unsigned":true},"payer":"","granter":"","amount":[{"denom":"uosmo","amount":"185"}]}},"body":{"memo":"","timeoutHeight":{"low":0,"high":0,"unsigned":true},"messages":[{"typeUrl":"/cosmos.gov.v1beta1.MsgVote","value":{"0":8,"1":209,"2":2,"3":18,"4":43,"5":111,"6":115,"7":109,"8":111,"9":49,"10":103,"11":99,"12":102,"13":51,"14":102,"15":104,"16":117,"17":100,"18":117,"19":56,"20":54,"21":108,"22":100,"23":54,"24":57,"25":99,"26":108,"27":102,"28":108,"29":100,"30":114,"31":50,"32":120,"33":108,"34":55,"35":107,"36":121,"37":108,"38":110,"39":104,"40":107,"41":120,"42":56,"43":104,"44":112,"45":55,"46":101,"47":52,"48":24,"49":1}}],"extensionOptions":[],"nonCriticalExtensionOptions":[]},"signatures":[{"0":106,"1":76,"2":194,"3":177,"4":167,"5":23,"6":50,"7":24,"8":108,"9":202,"10":74,"11":129,"12":55,"13":248,"14":55,"15":32,"16":197,"17":234,"18":153,"19":64,"20":99,"21":40,"22":204,"23":43,"24":147,"25":40,"26":79,"27":3,"28":112,"29":22,"30":154,"31":66,"32":98,"33":150,"34":26,"35":93,"36":38,"37":34,"38":157,"39":173,"40":85,"41":142,"42":229,"43":157,"44":113,"45":226,"46":63,"47":190,"48":222,"49":110,"50":11,"51":92,"52":168,"53":97,"54":221,"55":139,"56":36,"57":129,"58":48,"59":146,"60":223,"61":41,"62":245,"63":206}]}`;
const tx2 = `0a96020a93020a2a2f6f736d6f7369732e67616d6d2e763162657461312e4d7367537761704578616374416d6f756e74496e12e4010a2b6f736d6f3171706d6761747163356d7a6570327a797433337a743670677a3477776e7735666d6174356d6e120908011205756f736d6f124908a00612446962632f304546313544463246303234383041444530424236453835443945424235444145413238333644333836304539463937463941414445344635374133314141301a500a446962632f3237333934464230393244324543434435363132334337344633364534433146393236303031434541444139434139374541363232423235463431453545423212083430303639333639220d3333313537373032333431363812680a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103c5ebcb53afa04d00b544d3b9ffa592bee0bb8b31092dbbf97586a5ae3a6d4dac12040a02087f180512140a0e0a05756f736d6f1205313235303010a0c21e1a4055eac11305d2e8091252cfd3a949177545da83e0f3ff923f97d28e1a4fcb9bc5068e3e068048093f424d17641cb9a4b96d05dc70ea54a025351c1ce39e332708`;
const tx2Decoded = `{"authInfo":{"signerInfos":[{"sequence":{"low":5,"high":0,"unsigned":true},"publicKey":{"typeUrl":"/cosmos.crypto.secp256k1.PubKey","value":{"0":10,"1":33,"2":3,"3":197,"4":235,"5":203,"6":83,"7":175,"8":160,"9":77,"10":0,"11":181,"12":68,"13":211,"14":185,"15":255,"16":165,"17":146,"18":190,"19":224,"20":187,"21":139,"22":49,"23":9,"24":45,"25":187,"26":249,"27":117,"28":134,"29":165,"30":174,"31":58,"32":109,"33":77,"34":172}},"modeInfo":{"single":{"mode":127}}}],"fee":{"gasLimit":{"low":500000,"high":0,"unsigned":true},"payer":"","granter":"","amount":[{"denom":"uosmo","amount":"12500"}]}},"body":{"memo":"","timeoutHeight":{"low":0,"high":0,"unsigned":true},"messages":[{"typeUrl":"/osmosis.gamm.v1beta1.MsgSwapExactAmountIn","value":{"0":10,"1":43,"2":111,"3":115,"4":109,"5":111,"6":49,"7":113,"8":112,"9":109,"10":103,"11":97,"12":116,"13":113,"14":99,"15":53,"16":109,"17":122,"18":101,"19":112,"20":50,"21":122,"22":121,"23":116,"24":51,"25":51,"26":122,"27":116,"28":54,"29":112,"30":103,"31":122,"32":52,"33":119,"34":119,"35":110,"36":119,"37":53,"38":102,"39":109,"40":97,"41":116,"42":53,"43":109,"44":110,"45":18,"46":9,"47":8,"48":1,"49":18,"50":5,"51":117,"52":111,"53":115,"54":109,"55":111,"56":18,"57":73,"58":8,"59":160,"60":6,"61":18,"62":68,"63":105,"64":98,"65":99,"66":47,"67":48,"68":69,"69":70,"70":49,"71":53,"72":68,"73":70,"74":50,"75":70,"76":48,"77":50,"78":52,"79":56,"80":48,"81":65,"82":68,"83":69,"84":48,"85":66,"86":66,"87":54,"88":69,"89":56,"90":53,"91":68,"92":57,"93":69,"94":66,"95":66,"96":53,"97":68,"98":65,"99":69,"100":65,"101":50,"102":56,"103":51,"104":54,"105":68,"106":51,"107":56,"108":54,"109":48,"110":69,"111":57,"112":70,"113":57,"114":55,"115":70,"116":57,"117":65,"118":65,"119":68,"120":69,"121":52,"122":70,"123":53,"124":55,"125":65,"126":51,"127":49,"128":65,"129":65,"130":48,"131":26,"132":80,"133":10,"134":68,"135":105,"136":98,"137":99,"138":47,"139":50,"140":55,"141":51,"142":57,"143":52,"144":70,"145":66,"146":48,"147":57,"148":50,"149":68,"150":50,"151":69,"152":67,"153":67,"154":68,"155":53,"156":54,"157":49,"158":50,"159":51,"160":67,"161":55,"162":52,"163":70,"164":51,"165":54,"166":69,"167":52,"168":67,"169":49,"170":70,"171":57,"172":50,"173":54,"174":48,"175":48,"176":49,"177":67,"178":69,"179":65,"180":68,"181":65,"182":57,"183":67,"184":65,"185":57,"186":55,"187":69,"188":65,"189":54,"190":50,"191":50,"192":66,"193":50,"194":53,"195":70,"196":52,"197":49,"198":69,"199":53,"200":69,"201":66,"202":50,"203":18,"204":8,"205":52,"206":48,"207":48,"208":54,"209":57,"210":51,"211":54,"212":57,"213":34,"214":13,"215":51,"216":51,"217":49,"218":53,"219":55,"220":55,"221":48,"222":50,"223":51,"224":52,"225":49,"226":54,"227":56}}],"extensionOptions":[],"nonCriticalExtensionOptions":[]},"signatures":[{"0":85,"1":234,"2":193,"3":19,"4":5,"5":210,"6":232,"7":9,"8":18,"9":82,"10":207,"11":211,"12":169,"13":73,"14":23,"15":117,"16":69,"17":218,"18":131,"19":224,"20":243,"21":255,"22":146,"23":63,"24":151,"25":210,"26":142,"27":26,"28":79,"29":203,"30":155,"31":197,"32":6,"33":142,"34":62,"35":6,"36":128,"37":72,"38":9,"39":63,"40":66,"41":77,"42":23,"43":100,"44":28,"45":185,"46":164,"47":185,"48":109,"49":5,"50":220,"51":112,"52":234,"53":84,"54":160,"55":37,"56":53,"57":28,"58":28,"59":227,"60":158,"61":51,"62":39,"63":8}]}`;

describe('Cosmos Event Subscriber Tests', () => {
  it('should callback with current event data', async () => {
    const api = getApi([
      {
        block: {
          header: {
            height: 10,
          },
          txs: [Buffer.from(tx1, 'hex'), Buffer.from(tx2, 'hex')],
        },
      },
    ]);
    const subscriber = new Subscriber(api, 'test');
    const events: RawEvent[] = [];

    // triggers immediately
    await subscriber.subscribe((event) => {
      events.push(event);
    });
    assert.sameDeepMembers(
      events.map(({ height, message }) => ({
        height,
        typeUrl: message.typeUrl,
      })),
      [
        {
          height: 10,
          typeUrl: JSON.parse(tx1Decoded).body.messages[0].typeUrl,
        },
        {
          height: 10,
          typeUrl: JSON.parse(tx2Decoded).body.messages[0].typeUrl,
        },
      ]
    );

    subscriber.unsubscribe();
  });

  xit('should callback with historical event data', async () => {});

  xit('should fail gracefully on inaccessible old blocks', () => {});
});
