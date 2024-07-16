import { ForceAtlasEdgeElement, ForceAtlasNodeElement } from '@plait/graph-viz';
const dataArr = [
    {
        relations: [
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '620a2b47a204dd80b202e2b3'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '5fc86534515b3aafce58b98f'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '5fc86448515b3afa1758b97f'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '5fc864ea515b3a255858b988'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '61cd722cdfb11637cfe6ec4d'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '63eb4bb504440b75545e4953'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '60cabe49b4095a2ad0bbdfa9'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '61cd7244dfb11637cfe6ec51'
            },
            {
                source_id: '620a2b47a204dd80b202e2b3',
                target_id: '60cabe37b4095a262ebbdfa7'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '620a2d40bfff0debe7fb0903'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '5fc8805b515b3aaca558b9e8'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '620a2b47a204dd80b202e2b3'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '5fc87fd8515b3a607b58b9e0'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '620f624007dd52218a861f23'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '61cd7244dfb11637cfe6ec51'
            },
            {
                source_id: '620a2d40bfff0debe7fb0903',
                target_id: '60cabe37b4095a262ebbdfa7'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc8643e515b3a432b58b97d'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc879ac515b3a19e558b9a2'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc8789b515b3a7bf758b994'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc87d08515b3aba7458b9b6'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc87d57515b3a685158b9ba'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc87d31515b3a7cc858b9b8'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc87f32515b3a383158b9d0'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '620a2b47a204dd80b202e2b3'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc86453515b3aeffe58b981'
            },
            {
                source_id: '5fc8643e515b3a432b58b97d',
                target_id: '5fc87cfa515b3ad37558b9b4'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc87f32515b3a383158b9d0'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87a5c515b3a501558b9b0'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87fb1515b3a8b2f58b9dc'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87f70515b3a571758b9d2'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87f96515b3a59fc58b9d8'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87f8d515b3ad3a158b9d6'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc88699515b3ad91558ba2e'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87fa5515b3a795958b9da'
            },
            {
                source_id: '5fc87f32515b3a383158b9d0',
                target_id: '5fc87fc9515b3a309258b9de'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '61cd722cdfb11637cfe6ec4d'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb813cfd52473cefe1fb7'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb81dcfd52473cefe1fbd'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb824cfd52473cefe1fc4'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb07b3d2784c0602df464'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '620cb850a2d917b9bb70d7a6'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb8093d2784c0602df59e'
            },
            {
                source_id: '61cd722cdfb11637cfe6ec4d',
                target_id: '622eb82f3d2784c0602df5b1'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc86448515b3afa1758b97f'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '620c9703a2d917b9bb70cfb4'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '622eb24dcfd52473cefe1e84'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '622eb2a0cfd52473cefe1e93'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '620c96f9a2d917b9bb70cfab'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '620f39d407dd52218a86176a'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '620f39c907dd52218a86175e'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '620f39dc07dd52218a861778'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '622eb178cfd52473cefe1e77'
            },
            {
                source_id: '5fc86448515b3afa1758b97f',
                target_id: '622eb567cfd52473cefe1f30'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc864ea515b3a255858b988'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '5fc881f7515b3ae72858ba06'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '5fc88212515b3a994258ba0c'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '622eb7a03d2784c0602df58f'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '5fc881fe515b3a415358ba08'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '5fc88219515b3a0f0b58ba0e'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '620cb871f3af83317262a224'
            },
            {
                source_id: '5fc864ea515b3a255858b988',
                target_id: '5fc88221515b3aa2a058ba10'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '63eb4bb504440b75545e4953'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '5fc882a2515b3a49eb58ba1e'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '63eb4c3704440b75545e4986'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '5fc882aa515b3a74e358ba20'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '63eb4c4404440b75545e4992'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '63eb4c5104440b75545e4997'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '63eb4c5b3f1bad1759571c6d'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '63eb4c1104440b75545e4973'
            },
            {
                source_id: '63eb4bb504440b75545e4953',
                target_id: '5fc8828c515b3a300158ba1a'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '61cd7244dfb11637cfe6ec51'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '620f57f507dd52218a861cc4'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '63eb4e5f3f1bad1759571d92'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '620b446bf3af833172627c82'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '63e4b04a403a40b5de9cb114'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '63e9df222476b23086099cad'
            },
            {
                source_id: '61cd7244dfb11637cfe6ec51',
                target_id: '620b4493f3af833172627ca6'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc86534515b3aafce58b98f'
            },
            {
                source_id: '5fc86534515b3aafce58b98f',
                target_id: '5fc8832d515b3abe0658ba22'
            },
            {
                source_id: '5fc86534515b3aafce58b98f',
                target_id: '6214b936d5cf593836b39b91'
            },
            {
                source_id: '5fc86534515b3aafce58b98f',
                target_id: '6217325e06a2ec95ca7f7d81'
            },
            {
                source_id: '5fc86534515b3aafce58b98f',
                target_id: '5fc88334515b3a5a4858ba24'
            },
            {
                source_id: '5fc86534515b3aafce58b98f',
                target_id: '620b46daa2d917b9bb70b1db'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '60cabe37b4095a262ebbdfa7'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe713b7b5bb3d2b07cae'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe853b7b5bf72db07caf'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe92b4095ae8e0bbdfb2'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '620b8a00f3af833172628e11'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe8bb4095af2b0bbdfb1'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe78b4095a77bebbdfae'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '620a26edbfff0debe7fb06ff'
            },
            {
                source_id: '60cabe37b4095a262ebbdfa7',
                target_id: '60cabe69b4095a06aebbdfab'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc86453515b3aeffe58b981'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc87a5c515b3a501558b9b0'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc87a43515b3a17aa58b9ae'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '63e48faa2476b2308609279b'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc87a27515b3ad5be58b9a8'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc879db515b3a7bcb58b9a4'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc879e6515b3ac71258b9a6'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '63f364bd4f4c5e000faeb3ca'
            },
            {
                source_id: '5fc86453515b3aeffe58b981',
                target_id: '5fc87a2f515b3a921c58b9aa'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc87fd8515b3a607b58b9e0'
            },
            {
                source_id: '5fc87fd8515b3a607b58b9e0',
                target_id: '5fc88026515b3a943258b9e2'
            },
            {
                source_id: '5fc87fd8515b3a607b58b9e0',
                target_id: '5fc881a3515b3a141358ba04'
            },
            {
                source_id: '5fc87fd8515b3a607b58b9e0',
                target_id: '5fc88036515b3a7e8458b9e4'
            },
            {
                source_id: '5fc87fd8515b3a607b58b9e0',
                target_id: '5fc88048515b3a9ffa58b9e6'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc8645b515b3ad14258b983'
            },
            {
                source_id: '5fc8645b515b3ad14258b983',
                target_id: '621733b406a2ec95ca7f7da7'
            },
            {
                source_id: '5fc8645b515b3ad14258b983',
                target_id: '62145741d5cf593836b381bb'
            },
            {
                source_id: '5fc8642e515b3ac28f58b979',
                target_id: '5fc8805b515b3aaca558b9e8'
            },
            {
                source_id: '5fc8805b515b3aaca558b9e8',
                target_id: '5fc88082515b3a188958b9ec'
            },
            {
                source_id: '5fc8805b515b3aaca558b9e8',
                target_id: '5fc88078515b3a5d7958b9ea'
            },
            {
                source_id: '600810ed36f33453df2b6002',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '6188efc526568720495b1cfe',
                target_id: '600810ed36f33453df2b6002'
            },
            {
                source_id: '625d3027afe2f068052a795c',
                target_id: '600810ed36f33453df2b6002'
            },
            {
                source_id: '636a453f41917495411536c1',
                target_id: '600810ed36f33453df2b6002'
            },
            {
                source_id: '619df1ec58c093d6c55feae8',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '625ccced85515a547a29871e',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '62661432a7e5dd0681977080',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '62862d0d9e5a2fc66a2d7652',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '62cf8ed333d2df2360e76826',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '62fc8e33511d92c96afe5eb7',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '6319b207a445149cba59af16',
                target_id: '5fc8642e515b3ac28f58b979'
            },
            {
                source_id: '61adabab6334350181b3510b',
                target_id: '6319b207a445149cba59af16'
            },
            {
                source_id: '620ccee2a2d917b9bb70dd82',
                target_id: '6319b207a445149cba59af16'
            },
            {
                source_id: '632e99fdb3eb9feff05fbcff',
                target_id: '6319b207a445149cba59af16'
            },
            {
                source_id: '6357fde63f71c8ec73438a34',
                target_id: '6319b207a445149cba59af16'
            },
            {
                source_id: '648ea5f902bd842507e9c47f',
                target_id: '6319b207a445149cba59af16'
            }
        ],
        pages: [
            {
                _id: '5fc8642e515b3ac28f58b979',
                name: '用户指南',
                type: 1,
                emoji_icon: '1F3D5-1F3FB'
            },
            {
                _id: '620a2b47a204dd80b202e2b3',
                name: '什么是 PingCode？',
                type: 1,
                emoji_icon: '1F525-1F3FB'
            },
            {
                _id: '5fc86534515b3aafce58b98f',
                name: '协作空间',
                type: 1,
                emoji_icon: '1F3C6-1F3FB'
            },
            {
                _id: '5fc86448515b3afa1758b97f',
                name: '项目管理',
                type: 1,
                emoji_icon: '1F5F3-1F3FB'
            },
            {
                _id: '5fc864ea515b3a255858b988',
                name: '测试管理',
                type: 1,
                emoji_icon: '1F5C2-1F3FB'
            },
            {
                _id: '61cd722cdfb11637cfe6ec4d',
                name: '产品管理',
                type: 1,
                emoji_icon: '1F680-1F3FB'
            },
            {
                _id: '63eb4bb504440b75545e4953',
                name: '知识管理',
                type: 1,
                emoji_icon: '1F4D7'
            },
            {
                _id: '60cabe49b4095a2ad0bbdfa9',
                name: '目录服务',
                type: 1
            },
            {
                _id: '61cd7244dfb11637cfe6ec51',
                name: '效能度量',
                type: 1,
                emoji_icon: '1F4CA-1F3FB'
            },
            {
                _id: '60cabe37b4095a262ebbdfa7',
                name: '自动化',
                type: 1,
                emoji_icon: '26A1-1F3FB'
            },
            {
                _id: '620a2d40bfff0debe7fb0903',
                name: '为什么使用 PingCode',
                type: 1,
                emoji_icon: '1F3C6-1F3FB'
            },
            {
                _id: '5fc8805b515b3aaca558b9e8',
                name: '开发者资源',
                type: 1,
                emoji_icon: '1F56F-1F3FB'
            },
            {
                _id: '5fc87fd8515b3a607b58b9e0',
                name: '应用市场',
                type: 1,
                emoji_icon: '1F38F-1F3FB'
            },
            {
                _id: '620f624007dd52218a861f23',
                name: '售后服务',
                type: 1
            },
            {
                _id: '5fc8643e515b3a432b58b97d',
                name: '快速入门',
                type: 1,
                emoji_icon: '1F3BE-1F3FB'
            },
            {
                _id: '5fc879ac515b3a19e558b9a2',
                name: '2. 邀请成员',
                type: 1,
                emoji_icon: '1F64B-1F3FB'
            },
            {
                _id: '5fc8789b515b3a7bf758b994',
                name: '1. 创建企业',
                type: 1,
                emoji_icon: '1F44D-1F3FB'
            },
            {
                _id: '5fc87d08515b3aba7458b9b6',
                name: '4. 需求组织',
                type: 1
            },
            {
                _id: '5fc87d57515b3a685158b9ba',
                name: '6. 资料设置',
                type: 1
            },
            {
                _id: '5fc87d31515b3a7cc858b9b8',
                name: '5. 规划迭代',
                type: 1
            },
            {
                _id: '5fc87f32515b3a383158b9d0',
                name: '基础使用',
                type: 1,
                emoji_icon: 'tada-1F3FB'
            },
            {
                _id: '5fc86453515b3aeffe58b981',
                name: '管理员手册',
                type: 1,
                emoji_icon: '1F64D-1F3FB'
            },
            {
                _id: '5fc87cfa515b3ad37558b9b4',
                name: '3. 创建项目',
                type: 1
            },
            {
                _id: '5fc87a5c515b3a501558b9b0',
                name: '订阅管理',
                type: 1
            },
            {
                _id: '5fc87fb1515b3a8b2f58b9dc',
                name: '快捷工具栏',
                type: 1
            },
            {
                _id: '5fc87f70515b3a571758b9d2',
                name: '工作台',
                type: 1
            },
            {
                _id: '5fc87f96515b3a59fc58b9d8',
                name: '全局搜索',
                type: 1
            },
            {
                _id: '5fc87f8d515b3ad3a158b9d6',
                name: '快速新建',
                type: 1
            },
            {
                _id: '5fc88699515b3ad91558ba2e',
                name: '个人设置',
                type: 1
            },
            {
                _id: '5fc87fa5515b3a795958b9da',
                name: '消息通知',
                type: 1
            },
            {
                _id: '5fc87fc9515b3a309258b9de',
                name: '帮助与反馈',
                type: 1
            },
            {
                _id: '622eb813cfd52473cefe1fb7',
                name: '工单管理',
                type: 1
            },
            {
                _id: '622eb81dcfd52473cefe1fbd',
                name: '客户管理',
                type: 1
            },
            {
                _id: '622eb824cfd52473cefe1fc4',
                name: '渠道管理',
                type: 1
            },
            {
                _id: '622eb07b3d2784c0602df464',
                name: '产品管理',
                type: 1
            },
            {
                _id: '620cb850a2d917b9bb70d7a6',
                name: '基本概念',
                type: 1
            },
            {
                _id: '622eb8093d2784c0602df59e',
                name: '需求管理',
                type: 1
            },
            {
                _id: '622eb82f3d2784c0602df5b1',
                name: '需求排期',
                type: 1
            },
            {
                _id: '620c9703a2d917b9bb70cfb4',
                name: '项目管理',
                type: 1
            },
            {
                _id: '622eb24dcfd52473cefe1e84',
                name: '工时管理',
                type: 1
            },
            {
                _id: '622eb2a0cfd52473cefe1e93',
                name: '发布管理',
                type: 1
            },
            {
                _id: '620c96f9a2d917b9bb70cfab',
                name: '基本概念',
                type: 1
            },
            {
                _id: '620f39d407dd52218a86176a',
                name: 'Kanban 开发',
                type: 1
            },
            {
                _id: '620f39c907dd52218a86175e',
                name: 'Scrum 开发',
                type: 1
            },
            {
                _id: '620f39dc07dd52218a861778',
                name: '瀑布开发',
                type: 1
            },
            {
                _id: '622eb178cfd52473cefe1e77',
                name: '筛选器',
                type: 1
            },
            {
                _id: '622eb567cfd52473cefe1f30',
                name: '工作项',
                type: 1
            },
            {
                _id: '5fc881f7515b3ae72858ba06',
                name: '测试库管理',
                type: 1
            },
            {
                _id: '5fc88212515b3a994258ba0c',
                name: '测试计划管理',
                type: 1
            },
            {
                _id: '622eb7a03d2784c0602df58f',
                name: '用例评审',
                type: 1
            },
            {
                _id: '5fc881fe515b3a415358ba08',
                name: '测试用例',
                type: 1
            },
            {
                _id: '5fc88219515b3a0f0b58ba0e',
                name: '统计报表',
                type: 1
            },
            {
                _id: '620cb871f3af83317262a224',
                name: '基本概念',
                type: 1
            },
            {
                _id: '5fc88221515b3aa2a058ba10',
                name: '测试待办',
                type: 1
            },
            {
                _id: '5fc882a2515b3a49eb58ba1e',
                name: '页面模板',
                type: 1
            },
            {
                _id: '63eb4c3704440b75545e4986',
                name: '与我相关',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '5fc882aa515b3a74e358ba20',
                name: '页面导入与导出',
                type: 1
            },
            {
                _id: '63eb4c4404440b75545e4992',
                name: '页面管理',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '63eb4c5104440b75545e4997',
                name: '页面编辑',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '63eb4c5b3f1bad1759571c6d',
                name: '页面共享',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '63eb4c1104440b75545e4973',
                name: '空间管理',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '5fc8828c515b3a300158ba1a',
                name: '版本比对',
                type: 1
            },
            {
                _id: '620f57f507dd52218a861cc4',
                name: '基本概念',
                type: 1
            },
            {
                _id: '63eb4e5f3f1bad1759571d92',
                name: '报表管理',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '620b446bf3af833172627c82',
                name: '数据报表',
                type: 1
            },
            {
                _id: '63e4b04a403a40b5de9cb114',
                name: '视图管理',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '63e9df222476b23086099cad',
                name: '仪表盘管理',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '620b4493f3af833172627ca6',
                name: '分析指标',
                type: 1
            },
            {
                _id: '5fc8832d515b3abe0658ba22',
                name: '周期管理',
                type: 1
            },
            {
                _id: '6214b936d5cf593836b39b91',
                name: '成员目标',
                type: 1
            },
            {
                _id: '6217325e06a2ec95ca7f7d81',
                name: '基本概念',
                type: 1
            },
            {
                _id: '5fc88334515b3a5a4858ba24',
                name: '目标管理',
                type: 1
            },
            {
                _id: '620b46daa2d917b9bb70b1db',
                name: '数据分析',
                type: 1
            },
            {
                _id: '60cabe713b7b5bb3d2b07cae',
                name: '模板',
                type: 1
            },
            {
                _id: '60cabe853b7b5bf72db07caf',
                name: '触发器',
                type: 1
            },
            {
                _id: '60cabe92b4095ae8e0bbdfb2',
                name: '条件',
                type: 1
            },
            {
                _id: '620b8a00f3af833172628e11',
                name: '流程控制',
                type: 1
            },
            {
                _id: '60cabe8bb4095af2b0bbdfb1',
                name: '动作',
                type: 1
            },
            {
                _id: '60cabe78b4095a77bebbdfae',
                name: '连接器',
                type: 1
            },
            {
                _id: '620a26edbfff0debe7fb06ff',
                name: '基本概念',
                type: 1
            },
            {
                _id: '60cabe69b4095a06aebbdfab',
                name: '规则',
                type: 1
            },
            {
                _id: '5fc87a43515b3a17aa58b9ae',
                name: '协作空间管理员',
                type: 1
            },
            {
                _id: '63e48faa2476b2308609279b',
                name: '产品管理员',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '5fc87a27515b3ad5be58b9a8',
                name: '测试管理员',
                type: 1
            },
            {
                _id: '5fc879db515b3a7bcb58b9a4',
                name: '系统管理员',
                type: 1
            },
            {
                _id: '5fc879e6515b3ac71258b9a6',
                name: '项目管理员',
                type: 1
            },
            {
                _id: '63f364bd4f4c5e000faeb3ca',
                name: '效能度量管理员',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '5fc87a2f515b3a921c58b9aa',
                name: '空间管理员',
                type: 1
            },
            {
                _id: '5fc88026515b3a943258b9e2',
                name: '查找应用',
                type: 1
            },
            {
                _id: '5fc881a3515b3a141358ba04',
                name: '应用一览',
                type: 1
            },
            {
                _id: '5fc88036515b3a7e8458b9e4',
                name: '应用管理',
                type: 1
            },
            {
                _id: '5fc88048515b3a9ffa58b9e6',
                name: '自建应用',
                type: 1
            },
            {
                _id: '5fc8645b515b3ad14258b983',
                name: '最佳实践',
                type: 1,
                emoji_icon: '1F6CE-1F3FB'
            },
            {
                _id: '621733b406a2ec95ca7f7da7',
                name: '如何制定合理的团队目标',
                type: 1
            },
            {
                _id: '62145741d5cf593836b381bb',
                name: '如何落地实施研发效能度量',
                type: 1
            },
            {
                _id: '5fc88082515b3a188958b9ec',
                name: '开发接口',
                type: 1
            },
            {
                _id: '5fc88078515b3a5d7958b9ea',
                name: '凭据管理',
                type: 1
            },
            {
                _id: '600810ed36f33453df2b6002',
                name: '04 PingCode 用户手册',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '6188efc526568720495b1cfe',
                name: 'PingCode Bible',
                type: 1
            },
            {
                _id: '625d3027afe2f068052a795c',
                name: 'PingCode Demo演示系统说明书',
                type: 1
            },
            {
                _id: '636a453f41917495411536c1',
                name: 'Pingcode白皮书',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '619df1ec58c093d6c55feae8',
                name: 'PingCode 用户指南',
                type: 1
            },
            {
                _id: '625ccced85515a547a29871e',
                name: '售前新人培训计划V1.3',
                type: 1
            },
            {
                _id: '62661432a7e5dd0681977080',
                name: '和涛',
                type: 1
            },
            {
                _id: '62862d0d9e5a2fc66a2d7652',
                name: '入职工作目标计划',
                type: 1
            },
            {
                _id: '62cf8ed333d2df2360e76826',
                name: '售前新人培训计划V1.2',
                type: 1
            },
            {
                _id: '62fc8e33511d92c96afe5eb7',
                name: '入职工作目标计划',
                type: 1
            },
            {
                _id: '6319b207a445149cba59af16',
                name: '易成内容中心',
                type: 1,
                emoji_icon: '1F4F8'
            },
            {
                _id: '61adabab6334350181b3510b',
                name: 'anytao + terry = FUTURE',
                type: 1,
                emoji_icon: '2705'
            },
            {
                _id: '620ccee2a2d917b9bb70dd82',
                name: '2023',
                type: 1,
                emoji_icon: '1F430-1F3FB'
            },
            {
                _id: '632e99fdb3eb9feff05fbcff',
                name: 'FY22-Q4的规划与验证',
                type: 1,
                emoji_icon: '1F4C8'
            },
            {
                _id: '6357fde63f71c8ec73438a34',
                name: 'The One 2023',
                type: 1,
                emoji_icon: '26F5'
            },
            {
                _id: '648ea5f902bd842507e9c47f',
                name: '产品竞争力',
                type: 1,
                emoji_icon: '1F51F'
            }
        ]
    },
    {
        relations: [
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711f9396e29b980e995395',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711e3f96e29b980e99534f',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711f8696e29b980e995380',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '6673cee2118defe930762949'
            },
            {
                source_id: '6673cee2118defe930762949',
                target_id: '667e25133f0094e1baad5bff'
            },
            {
                source_id: '6673cee2118defe930762949',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '668687659878b1300e0dad4c'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '6694ff51b306888acb64e890'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66909103d0a12a4cc9cd0464'
            }
        ],
        pages: [
            {
                _id: '66711b4396e29b980e995326',
                name: '主页',
                type: 1,
                emoji_icon: '1F602'
            },
            {
                _id: '66711f9396e29b980e995395',
                name: '页面C页面C页面C页面C页面C页面C页面C页面C页面C页面C',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711e3f96e29b980e99534f',
                name: '页面A',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66711f8696e29b980e995380',
                name: '页面B页面B页面B页面B页面B',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '6673cee2118defe930762949',
                name: '回流主页',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '667e25133f0094e1baad5bff',
                name: '页面D',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '668687659878b1300e0dad4c',
                name: '无标题画板名字特特特特特特特特特长',
                type: 3,
                emoji_icon: ''
            },
            {
                _id: '6694ff51b306888acb64e890',
                name: 'sss',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66909103d0a12a4cc9cd0464',
                name: '自引用',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '66711f9396e29b980e995395',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711e3f96e29b980e99534f',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '6673cee2118defe930762949',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '66711f8696e29b980e995380',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66864c394198bb8dfbb2a5ae',
                target_id: '66711f8696e29b980e995380'
            }
        ],
        pages: [
            {
                _id: '66711f9396e29b980e995395',
                name: '页面C页面C页面C页面C页面C页面C页面C页面C页面C页面C',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711e3f96e29b980e99534f',
                name: '页面A',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66711f8696e29b980e995380',
                name: '页面B页面B页面B页面B页面B',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711b4396e29b980e995326',
                name: '主页',
                type: 1,
                emoji_icon: '1F602'
            },
            {
                _id: '6673cee2118defe930762949',
                name: '回流主页',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66864c394198bb8dfbb2a5ae',
                name: '页面E',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '66729bb767e0d4df59043714',
                target_id: '66729bd867e0d4df5904372d'
            },
            {
                source_id: '66729bd867e0d4df5904372d',
                target_id: '66729bb767e0d4df59043714'
            }
        ],
        pages: [
            {
                _id: '66729bb767e0d4df59043714',
                name: '相互引用1',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66729bd867e0d4df5904372d',
                name: '相互引用2',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '6696221b3a8f8aaa1a5f3b1c',
                target_id: '669622363a8f8aaa1a5f3b2d'
            },
            {
                source_id: '669622363a8f8aaa1a5f3b2d',
                target_id: '6696223e3a8f8aaa1a5f3b3e'
            }
        ],
        pages: [
            {
                _id: '6696221b3a8f8aaa1a5f3b1c',
                name: 'cs数据1',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '669622363a8f8aaa1a5f3b2d',
                name: 'cs数据2',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '6696223e3a8f8aaa1a5f3b3e',
                name: 'cs数据3',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '669622363a8f8aaa1a5f3b2d',
                target_id: '6696223e3a8f8aaa1a5f3b3e'
            },
            {
                source_id: '6696223e3a8f8aaa1a5f3b3e',
                target_id: '6696291b3a8f8aaa1a5f3cde'
            },
            {
                source_id: '6696221b3a8f8aaa1a5f3b1c',
                target_id: '669622363a8f8aaa1a5f3b2d'
            }
        ],
        pages: [
            {
                _id: '669622363a8f8aaa1a5f3b2d',
                name: 'cs数据2',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '6696223e3a8f8aaa1a5f3b3e',
                name: 'cs数据3',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '6696291b3a8f8aaa1a5f3cde',
                name: 'cs数据4',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '6696221b3a8f8aaa1a5f3b1c',
                name: 'cs数据1',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '66711e3f96e29b980e99534f',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711f8696e29b980e995380',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '6673cee2118defe930762949',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '66711f9396e29b980e995395',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '667d2a610a8604374b346656',
                target_id: '66711e3f96e29b980e99534f'
            }
        ],
        pages: [
            {
                _id: '66711e3f96e29b980e99534f',
                name: '页面A',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66711f8696e29b980e995380',
                name: '页面B页面B页面B页面B页面B',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711f9396e29b980e995395',
                name: '页面C页面C页面C页面C页面C页面C页面C页面C页面C页面C',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711b4396e29b980e995326',
                name: '主页',
                type: 1,
                emoji_icon: '1F602'
            },
            {
                _id: '6673cee2118defe930762949',
                name: '回流主页',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '667d2a610a8604374b346656',
                name: '附件',
                type: 1,
                emoji_icon: null
            }
        ]
    },
    {
        relations: [
            {
                source_id: '66711f8696e29b980e995380',
                target_id: '66711f9396e29b980e995395'
            },
            {
                source_id: '66711f9396e29b980e995395',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '6673cee2118defe930762949',
                target_id: '66711b4396e29b980e995326'
            },
            {
                source_id: '66711e3f96e29b980e99534f',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '66711b4396e29b980e995326',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '667d2a610a8604374b346656',
                target_id: '66711e3f96e29b980e99534f'
            },
            {
                source_id: '66864c394198bb8dfbb2a5ae',
                target_id: '66711f8696e29b980e995380'
            },
            {
                source_id: '667e25133f0094e1baad5bff',
                target_id: '66864c394198bb8dfbb2a5ae'
            }
        ],
        pages: [
            {
                _id: '66711f8696e29b980e995380',
                name: '页面B页面B页面B页面B页面B',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711f9396e29b980e995395',
                name: '页面C页面C页面C页面C页面C页面C页面C页面C页面C页面C',
                type: 1,
                emoji_icon: ''
            },
            {
                _id: '66711e3f96e29b980e99534f',
                name: '页面A',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66711b4396e29b980e995326',
                name: '主页',
                type: 1,
                emoji_icon: '1F602'
            },
            {
                _id: '6673cee2118defe930762949',
                name: '回流主页',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '667d2a610a8604374b346656',
                name: '附件',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '66864c394198bb8dfbb2a5ae',
                name: '页面E',
                type: 1,
                emoji_icon: null
            },
            {
                _id: '667e25133f0094e1baad5bff',
                name: '页面D',
                type: 1,
                emoji_icon: null
            }
        ]
    }
];
export function getData(index: number = 0) {
    let res: { relations: any[]; pages: any[] } = dataArr[index];
    console.log('节点数：', res.pages.length);
    const activeId = res.pages[0]._id;
    const nodes = res.pages.map(
        page =>
            ({
                id: page._id,
                label: page.name,
                isActive: page._id === activeId,
                icon: page.emoji_icon || 'file-fill',
                styles: {
                    fill: page.type === 1 ? '#9C9CFB' : '#F98A7C'
                }
            } as ForceAtlasNodeElement)
    );
    const relations = res.relations.map(
        (edge, i) => ({ id: `${i}`, source: edge.source_id, target: edge.target_id } as ForceAtlasEdgeElement)
    );
    return [
        {
            id: `${Math.random() * 99999}`,
            type: 'force-atlas',
            children: [...nodes, ...relations]
        }
    ];
}
