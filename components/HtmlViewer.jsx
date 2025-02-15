import { StyleSheet } from 'react-native'
import React from 'react'
import RenderHtml from "react-native-render-html";

const HtmlViewer = ({contentWidth, html}) => {
  return (
    <RenderHtml
      contentWidth={contentWidth}
      source={{ html: html || ""}}
    />
  )
}

export default HtmlViewer

const styles = StyleSheet.create({})