import React,{useEffect,useState} from "react";
import {View,Text,TouchableOpacity,FlatList,ActivityIndicator,StyleSheet} from "react-native";
import {Video,ResizeMode} from "expo-av";

const API="https://live-production-ec29.up.railway.app/channels";

export default function App(){
  const [channels,setChannels]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);

  useEffect(()=>{
    fetch(API)
      .then(r=>r.json())
      .then(data=>setChannels(data))
      .catch(console.log)
      .finally(()=>setLoading(false));
  },[]);

  if(selected){
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={()=>setSelected(null)}>
          <Text style={styles.backText}>رجوع</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{selected.name}</Text>

        <Video
          style={styles.video}
          source={{uri:selected.url}}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>البث المباشر</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff"/>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(i)=>String(i.id)}
          renderItem={({item})=>(
            <TouchableOpacity style={styles.card} onPress={()=>setSelected(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>اضغط للمشاهدة</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#0f172a",
    paddingTop:50,
    padding:20
  },
  header:{
    fontSize:28,
    color:"#fff",
    fontWeight:"bold",
    textAlign:"center",
    marginBottom:30
  },
  card:{
    backgroundColor:"#1e293b",
    padding:20,
    borderRadius:16,
    marginBottom:14
  },
  name:{
    color:"#fff",
    fontSize:20,
    fontWeight:"bold"
  },
  sub:{
    color:"#94a3b8",
    marginTop:6
  },
  back:{
    backgroundColor:"#1e293b",
    padding:12,
    borderRadius:12,
    alignSelf:"flex-start",
    marginBottom:20
  },
  backText:{
    color:"#fff",
    fontSize:16
  },
  title:{
    color:"#fff",
    fontSize:24,
    fontWeight:"bold",
    textAlign:"center",
    marginBottom:20
  },
  video:{
    width:"100%",
    height:260,
    backgroundColor:"#000",
    borderRadius:12
  }
});
